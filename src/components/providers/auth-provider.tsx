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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(profile)
    } catch (error) {
      console.error('Error in fetchProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Profile will be fetched automatically by the auth state change listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })

      if (error) throw error

      // If user was created successfully, update their profile with correct role
      if (data.user && userData.role) {
        // Wait a bit for the trigger to create the profile
        setTimeout(async () => {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ 
                role: userData.role,
                nome: userData.nome || email
              })
              .eq('id', data.user.id)

            if (profileError) {
              console.error('Error updating profile role:', profileError)
            }

            // Create specific role record
            if (userData.role === 'empresa') {
              await supabase.from('empresas').insert({
                profile_id: data.user.id,
                nome: userData.nome,
                cnpj: userData.cnpj,
                categoria: userData.categoria,
                responsavel: userData.responsavel,
                telefone: userData.telefone,
                endereco: userData.endereco,
                status: 'pendente'
              })
            } else if (userData.role === 'entregador') {
              await supabase.from('entregadores').insert({
                profile_id: data.user.id,
                nome: userData.nome,
                cpf: userData.cpf,
                telefone: userData.telefone,
                veiculo: userData.veiculo,
                endereco: userData.endereco,
                status: 'pendente'
              })
            } else if (userData.role === 'consumidor') {
              await supabase.from('consumidores').insert({
                profile_id: data.user.id,
                nome: userData.nome,
                telefone: userData.telefone,
                endereco: userData.endereco
              })
            }
          } catch (error) {
            console.error('Error creating role-specific record:', error)
          }
        }, 1000)
      }

      // If email confirmation is disabled, profile will be created automatically
      // Otherwise, user needs to confirm email first
    } catch (error) {
      setLoading(false)
      throw error
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