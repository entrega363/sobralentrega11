'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { resetPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    
    try {
      await resetPassword(data.email)
      
      setIsSuccess(true)
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      })
    } catch (error: any) {
      console.error('Reset password error:', error)
      
      toast({
        title: 'Erro ao enviar email',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">📧</div>
        <div>
          <h3 className="text-lg font-semibold">Email enviado!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="w-full"
        >
          Enviar novamente
        </Button>
      </div>
    )
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar link de recuperação
      </Button>

      <div className="text-sm text-muted-foreground">
        <p>
          Você receberá um email com instruções para redefinir sua senha.
          Se não receber o email em alguns minutos, verifique sua pasta de spam.
        </p>
      </div>
    </form>
  )
}