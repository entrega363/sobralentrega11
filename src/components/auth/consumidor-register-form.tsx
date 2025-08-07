'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/providers/auth-provider'
import { consumidorRegisterSchema, type ConsumidorRegisterInput } from '@/lib/validations/auth'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function ConsumidorRegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsumidorRegisterInput>({
    resolver: zodResolver(consumidorRegisterSchema),
    defaultValues: {
      role: 'consumidor',
      endereco: {
        cidade: 'Sobral',
      },
    },
  })

  const onSubmit = async (data: ConsumidorRegisterInput) => {
    setIsLoading(true)
    
    try {
      await signUp(data.email, data.password, {
        role: 'consumidor',
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        endereco: data.endereco,
      })
      
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Verifique seu email para confirmar a conta.',
      })

      router.push('/login')
    } catch (error: any) {
      console.error('Register error:', error)
      
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Erro ao criar conta',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">👤</div>
        <h3 className="text-lg font-semibold">Cadastro de Consumidor</h3>
        <p className="text-sm text-muted-foreground">
          Preencha seus dados para criar sua conta
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input
            id="nome"
            placeholder="Seu nome completo"
            {...register('nome')}
            disabled={isLoading}
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            {...register('cpf')}
            disabled={isLoading}
          />
          {errors.cpf && (
            <p className="text-sm text-destructive">{errors.cpf.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            placeholder="(88) 99999-9999"
            {...register('telefone')}
            disabled={isLoading}
          />
          {errors.telefone && (
            <p className="text-sm text-destructive">{errors.telefone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Endereço</h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="endereco.rua">Rua</Label>
            <Input
              id="endereco.rua"
              placeholder="Nome da rua"
              {...register('endereco.rua')}
              disabled={isLoading}
            />
            {errors.endereco?.rua && (
              <p className="text-sm text-destructive">{errors.endereco.rua.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco.numero">Número</Label>
            <Input
              id="endereco.numero"
              placeholder="123"
              {...register('endereco.numero')}
              disabled={isLoading}
            />
            {errors.endereco?.numero && (
              <p className="text-sm text-destructive">{errors.endereco.numero.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endereco.bairro">Bairro</Label>
            <Input
              id="endereco.bairro"
              placeholder="Nome do bairro"
              {...register('endereco.bairro')}
              disabled={isLoading}
            />
            {errors.endereco?.bairro && (
              <p className="text-sm text-destructive">{errors.endereco.bairro.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco.cep">CEP</Label>
            <Input
              id="endereco.cep"
              placeholder="62000-000"
              {...register('endereco.cep')}
              disabled={isLoading}
            />
            {errors.endereco?.cep && (
              <p className="text-sm text-destructive">{errors.endereco.cep.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco.pontoReferencia">Ponto de referência (opcional)</Label>
          <Input
            id="endereco.pontoReferencia"
            placeholder="Ex: Próximo ao mercado"
            {...register('endereco.pontoReferencia')}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Criar conta
      </Button>
    </form>
  )
}