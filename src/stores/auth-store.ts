'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      
      reset: () => set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist non-sensitive data
        profile: state.profile,
        isInitialized: state.isInitialized,
      }),
    }
  )
)

// Computed selectors
export const useAuthSelectors = () => {
  const { user, session, profile, isLoading, isInitialized } = useAuthStore()
  
  return {
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!user && !!session,
    userRole: profile?.role || null,
    isAdmin: profile?.role === 'admin',
    isEmpresa: profile?.role === 'empresa',
    isEntregador: profile?.role === 'entregador',
    isConsumidor: profile?.role === 'consumidor',
  }
}