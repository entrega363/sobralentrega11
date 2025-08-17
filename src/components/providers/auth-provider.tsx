'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { User, Session } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { 
    setUser, 
    setSession, 
    setProfile, 
    setLoading, 
    setInitialized,
    reset 
  } = useAuthStore()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        if (session) {
          setSession(session)
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
        setInitialized(true)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser, setSession, setProfile, setLoading, setInitialized])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      // Force a fresh fetch by adding a timestamp to bypass any cache
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      console.log('Profile fetched:', profile)
      
      // Additional verification for specific user
      if (profile.email === 'matutaria@gmail.com') {
        console.log('MATUTARIA USER DETECTED - Role:', profile.role)
        
        // If role is not empresa, try to fix it
        if (profile.role !== 'empresa') {
          console.log('INCORRECT ROLE DETECTED - Attempting to fix...')
          
          // Call our fix endpoint
          try {
            const response = await fetch('/api/fix-matutaria-user', {
              method: 'POST'
            })
            
            if (response.ok) {
              console.log('User fixed, refetching profile...')
              // Refetch after fix
              const { data: fixedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
              
              if (fixedProfile) {
                console.log('Fixed profile:', fixedProfile)
                setProfile(fixedProfile)
                return
              }
            }
          } catch (fixError) {
            console.error('Error fixing user:', fixError)
          }
        }
      }
      
      setProfile(profile)
    } catch (error) {
      console.error('Error in fetchProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      // Clear any cached profile data before login
      setProfile(null)
      
      // Clear localStorage cache as well
      localStorage.removeItem('auth-storage')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Force fresh profile fetch after login with a small delay
      if (data.user) {
        // Wait a bit to ensure session is fully established
        setTimeout(async () => {
          await fetchProfile(data.user.id)
        }, 500)
      }
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true)
    
    const maxRetries = 3
    const baseDelay = 1000 // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentativa de cadastro ${attempt}/${maxRetries}...`)
        
        // Use our robust signup API endpoint instead of direct Supabase auth
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            ...userData,
          }),
        })
        
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          // Check if it's a retryable error
          const isRetryable = response.status >= 500 || 
                             result.error?.includes('timeout') ||
                             result.error?.includes('connection') ||
                             result.error?.includes('network')
          
          if (!isRetryable || attempt === maxRetries) {
            throw new Error(result.error || 'Erro no cadastro')
          }
          
          // Wait before retry with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt - 1)
          console.log(`Erro temporário, tentando novamente em ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        console.log('✅ Cadastro realizado com sucesso:', result.user)
        setLoading(false)
        return // Success, exit the retry loop
        
      } catch (error) {
        if (attempt === maxRetries) {
          setLoading(false)
          throw error
        }
        
        // Wait before retry
        const delay = baseDelay * Math.pow(2, attempt - 1)
        console.log(`Erro na tentativa ${attempt}, tentando novamente em ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  const signOut = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      reset()
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    })

    if (error) throw error
  }

  const value = {
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}