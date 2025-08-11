'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, User, Lock, ChefHat, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LoginFormData {
  usuario: string
  senha: string
}

export default function ComandaLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<LoginFormData>({
    usuario: '',
    senha: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.usuario.trim()) {
      newErrors.usuario = 'Usuário é obrigatório'
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/garcom/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ 
            usuario: 'Usuário ou senha incorretos',
            senha: 'Usuário ou senha incorretos'
          })
        } else if (response.status === 403) {
          setErrors({ 
            usuario: 'Garçom desativado. Contate o gerente'
          })
        } else {
          throw new Error(data.error || 'Erro no login')
        }
        return
      }

      // Salvar token no localStorage
      localStorage.setItem('garcom_token', data.token)
      localStorage.setItem('garcom_data', JSON.stringify(data.garcom))

      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo, ${data.garcom.nome}`,
      })

      // Redirecionar para o painel de comanda
      router.push('/comanda/dashboard')

    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sobral-red-50 to-sobral-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sobral-red-600 rounded-full mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Comanda
          </h1>
          <p className="text-gray-600">
            Acesso exclusivo para garçons
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Usuário */}
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={formData.usuario}
                    onChange={(e) => handleInputChange('usuario', e.target.value)}
                    className={`pl-10 ${errors.usuario ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.usuario && (
                  <p className="text-sm text-red-500">{errors.usuario}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={`pl-10 pr-10 ${errors.senha ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.senha && (
                  <p className="text-sm text-red-500">{errors.senha}</p>
                )}
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full bg-sobral-red-600 hover:bg-sobral-red-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-sobral-red-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao site principal
          </Link>
        </div>

        {/* Informações de Ajuda */}
        <div className="mt-6 p-4 bg-white/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Precisa de ajuda?
          </h3>
          <p className="text-xs text-gray-600">
            Se você esqueceu suas credenciais ou está com problemas para acessar, 
            entre em contato com o gerente do estabelecimento.
          </p>
        </div>
      </div>
    </div>
  )
}