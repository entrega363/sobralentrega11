'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthSelectors } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'
import { Save, User, Phone, MapPin, Mail, RefreshCw } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuthSelectors()

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'Sobral',
      cep: ''
    }
  })

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Por enquanto, vamos simular dados até implementar a API
      // TODO: Implementar chamada real para API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular loading
      
      // Dados simulados baseados no usuário logado
      const dadosSimulados = {
        nome: 'João Silva',
        cpf: '123.456.789-00',
        telefone: '(88) 99999-9999',
        email: user?.email || '',
        endereco: {
          rua: 'Rua das Flores',
          numero: '123',
          complemento: 'Apt 101',
          bairro: 'Centro',
          cidade: 'Sobral',
          cep: '62010-000'
        }
      }
      
      setFormData(dadosSimulados)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

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
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      
      // Validações básicas
      if (!formData.nome.trim()) {
        toast({
          title: 'Erro',
          description: 'Nome é obrigatório',
          variant: 'destructive'
        })
        return
      }

      if (!formData.telefone.trim()) {
        toast({
          title: 'Erro',
          description: 'Telefone é obrigatório',
          variant: 'destructive'
        })
        return
      }

      if (!formData.endereco.rua.trim()) {
        toast({
          title: 'Erro',
          description: 'Endereço é obrigatório',
          variant: 'destructive'
        })
        return
      }

      // TODO: Implementar chamada real para API
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simular salvamento
      
      toast({
        title: 'Sucesso',
        description: 'Dados salvos com sucesso!'
      })
      
    } catch (err) {
      console.error('Erro ao salvar dados:', err)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar dados. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando suas configurações...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-gray-600">Gerencie seus dados pessoais</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao carregar configurações
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={carregarDados}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-600">Gerencie seus dados pessoais e preferências</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Informações básicas da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    className="pl-10"
                    disabled
                    placeholder="seu@email.com"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Para alterar o email, entre em contato com o suporte
                </p>
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    className="pl-10"
                    placeholder="(88) 99999-9999"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço Principal
            </CardTitle>
            <CardDescription>
              Endereço padrão para entregas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="rua">Rua *</Label>
                <Input
                  id="rua"
                  value={formData.endereco.rua}
                  onChange={(e) => handleInputChange('endereco.rua', e.target.value)}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.endereco.numero}
                  onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.endereco.complemento}
                onChange={(e) => handleInputChange('endereco.complemento', e.target.value)}
                placeholder="Apartamento, bloco, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
              
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) => handleInputChange('endereco.cidade', e.target.value)}
                  placeholder="Sobral"
                />
              </div>
              
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.endereco.cep}
                  onChange={(e) => handleInputChange('endereco.cep', e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={carregarDados}
            disabled={isSaving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}