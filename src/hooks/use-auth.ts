'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Get current session
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    },
  })

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no login',
        description: error.message || 'Credenciais inválidas',
        variant: 'destructive',
      })
    },
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      role,
      userData 
    }: { 
      email: string
      password: string
      role: 'empresa' | 'entregador' | 'consumidor'
      userData: any
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            ...userData
          }
        }
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Verifique seu email para confirmar a conta.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Erro ao criar conta',
        variant: 'destructive',
      })
    },
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/')
      toast({
        title: 'Logout realizado com sucesso!',
        description: 'Até logo!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no logout',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    session,
    profile,
    user: session?.user,
    isLoading,
    isAuthenticated: !!session,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  }
}