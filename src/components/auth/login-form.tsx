'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/providers/auth-provider'
import { useAuthSelectors } from '@/stores/auth-store'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { isAuthenticated, userRole } = useAuthSelectors()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const redirectPath = {
        admin: '/admin',
        empresa: '/empresa',
        entregador: '/entregador',
        consumidor: '/consumidor',
      }[userRole]
      
      if (redirectPath) {
        router.push(redirectPath)
      }
    }
  }, [isAuthenticated, userRole, router])

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    
    try {
      await signIn(data.email, data.password)
      
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.',
      })

      // Redirect will happen automatically via auth state change
    } catch (error: any) {
      console.error('Login error:', error)
      
      toast({
        title: 'Erro no login',
        description: error.message || 'Credenciais inválidas',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Entrar
      </Button>

      {/* Admin quick login for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Desenvolvimento:</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              // Auto-fill admin credentials
              const emailInput = document.getElementById('email') as HTMLInputElement
              const passwordInput = document.getElementById('password') as HTMLInputElement
              if (emailInput && passwordInput) {
                emailInput.value = 'admin@entregasobral.com.br'
                passwordInput.value = 'tenderbr0'
              }
            }}
          >
            Preencher Admin (Dev)
          </Button>
        </div>
      )}
    </form>
  )
}