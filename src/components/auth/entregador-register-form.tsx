'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { entregadorRegisterSchema, type EntregadorRegisterInput } from '@/lib/validations/auth'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'
import { Eye, EyeOff } from 'lucide-react'

export function EntregadorRegisterForm() {
  const router = useRouter()
  const { signUp } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<EntregadorRegisterInput>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'entregador',
    nome: '',
    cpf: '',
    telefone: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: 'Sobral',
      cep: '',
    },
    veiculo: {
      tipo: '',
      placa: '',
      modelo: '',
    },
    cnh: '',
  })

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('endereco.')) {
      const enderecoField = field.replace('endereco.', '')
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }))
    } else if (field.startsWith('veiculo.')) {
      const veiculoField = field.replace('veiculo.', '')
      setFormData(prev => ({
        ...prev,
        veiculo: {
          ...prev.veiculo,
          [veiculoField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Validar dados
      const validatedData = entregadorRegisterSchema.parse(formData)

      // Registrar usuário
      await signUp(validatedData)

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Bem-vindo ao sistema de entregas de Sobral',
      })

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Erro no cadastro:', error)

      if (error.errors) {
        // Erros de validação do Zod
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          const field = err.path.join('.')
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
      } else {
        toast({
          title: 'Erro no cadastro',
          description: error.message || 'Ocorreu um erro inesperado',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="text-3xl mb-2">🛵</div>
        <CardTitle>Cadastro de Entregador</CardTitle>
        <CardDescription>
          Preencha os dados para se cadastrar como entregador
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  disabled={isLoading}
                />
                {errors.nome && <p className="text-sm text-red-500 mt-1">{errors.nome}</p>}
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  disabled={isLoading}
                />
                {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(85) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  disabled={isLoading}
                />
                {errors.telefone && <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="cnh">CNH</Label>
              <Input
                id="cnh"
                type="text"
                placeholder="Número da CNH"
                value={formData.cnh}
                onChange={(e) => handleInputChange('cnh', e.target.value)}
                disabled={isLoading}
              />
              {errors.cnh && <p className="text-sm text-red-500 mt-1">{errors.cnh}</p>}
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  type="text"
                  value={formData.endereco.rua}
                  onChange={(e) => handleInputChange('endereco.rua', e.target.value)}
                  disabled={isLoading}
                />
                {errors['endereco.rua'] && <p className="text-sm text-red-500 mt-1">{errors['endereco.rua']}</p>}
              </div>

              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  type="text"
                  value={formData.endereco.numero}
                  onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                  disabled={isLoading}
                />
                {errors['endereco.numero'] && <p className="text-sm text-red-500 mt-1">{errors['endereco.numero']}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  type="text"
                  value={formData.endereco.bairro}
                  onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                  disabled={isLoading}
                />
                {errors['endereco.bairro'] && <p className="text-sm text-red-500 mt-1">{errors['endereco.bairro']}</p>}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  type="text"
                  value={formData.endereco.cidade}
                  onChange={(e) => handleInputChange('endereco.cidade', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  type="text"
                  placeholder="00000-000"
                  value={formData.endereco.cep}
                  onChange={(e) => handleInputChange('endereco.cep', e.target.value)}
                  disabled={isLoading}
                />
                {errors['endereco.cep'] && <p className="text-sm text-red-500 mt-1">{errors['endereco.cep']}</p>}
              </div>
            </div>
          </div>

          {/* Veículo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados do Veículo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipo-veiculo">Tipo de Veículo</Label>
                <Select
                  value={formData.veiculo.tipo}
                  onValueChange={(value) => handleInputChange('veiculo.tipo', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="bicicleta">Bicicleta</SelectItem>
                  </SelectContent>
                </Select>
                {errors['veiculo.tipo'] && <p className="text-sm text-red-500 mt-1">{errors['veiculo.tipo']}</p>}
              </div>

              <div>
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  type="text"
                  placeholder="ABC-1234"
                  value={formData.veiculo.placa}
                  onChange={(e) => handleInputChange('veiculo.placa', e.target.value)}
                  disabled={isLoading}
                />
                {errors['veiculo.placa'] && <p className="text-sm text-red-500 mt-1">{errors['veiculo.placa']}</p>}
              </div>

              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  type="text"
                  placeholder="Ex: Honda CG 160"
                  value={formData.veiculo.modelo}
                  onChange={(e) => handleInputChange('veiculo.modelo', e.target.value)}
                  disabled={isLoading}
                />
                {errors['veiculo.modelo'] && <p className="text-sm text-red-500 mt-1">{errors['veiculo.modelo']}</p>}
              </div>
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Senha de Acesso</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Cadastrando...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}