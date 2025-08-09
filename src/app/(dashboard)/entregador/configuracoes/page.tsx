'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Save, User, Bell, Truck, Shield } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Dados do perfil
  const [perfilData, setPerfilData] = useState({
    nome: 'Entregador Sobral',
    telefone: '(85) 99999-9999',
    email: 'entregasobrald@gmail.com',
    cpf: '000.000.000-00',
    cnh: '12345678901'
  })

  // Dados do veículo
  const [veiculoData, setVeiculoData] = useState({
    tipo: 'moto',
    modelo: 'Honda CG 160',
    placa: 'ABC-1234',
    cor: 'Vermelha',
    ano: '2020'
  })

  // Configurações de notificação
  const [notificacoes, setNotificacoes] = useState({
    novas_entregas: true,
    mensagens_cliente: true,
    atualizacoes_sistema: false,
    promocoes: false
  })

  // Configurações de disponibilidade
  const [disponibilidade, setDisponibilidade] = useState({
    status: 'disponivel',
    raio_entrega: '5',
    aceitar_automatico: false
  })

  const handleSalvarPerfil = async () => {
    setIsLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSalvarVeiculo = async () => {
    setIsLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Veículo atualizado!',
        description: 'Informações do veículo foram salvas com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <div className="grid gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Informações Pessoais</CardTitle>
            </div>
            <CardDescription>
              Atualize seus dados pessoais e de contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={perfilData.nome}
                  onChange={(e) => setPerfilData({...perfilData, nome: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={perfilData.telefone}
                  onChange={(e) => setPerfilData({...perfilData, telefone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={perfilData.email}
                  onChange={(e) => setPerfilData({...perfilData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={perfilData.cpf}
                  onChange={(e) => setPerfilData({...perfilData, cpf: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cnh">CNH</Label>
              <Input
                id="cnh"
                value={perfilData.cnh}
                onChange={(e) => setPerfilData({...perfilData, cnh: e.target.value})}
              />
            </div>
            
            <Button onClick={handleSalvarPerfil} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </CardContent>
        </Card>

        {/* Informações do Veículo */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <CardTitle>Informações do Veículo</CardTitle>
            </div>
            <CardDescription>
              Mantenha os dados do seu veículo atualizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo de Veículo</Label>
                <Select
                  value={veiculoData.tipo}
                  onValueChange={(value) => setVeiculoData({...veiculoData, tipo: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="bicicleta">Bicicleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={veiculoData.modelo}
                  onChange={(e) => setVeiculoData({...veiculoData, modelo: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  value={veiculoData.placa}
                  onChange={(e) => setVeiculoData({...veiculoData, placa: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  value={veiculoData.cor}
                  onChange={(e) => setVeiculoData({...veiculoData, cor: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  value={veiculoData.ano}
                  onChange={(e) => setVeiculoData({...veiculoData, ano: e.target.value})}
                />
              </div>
            </div>
            
            <Button onClick={handleSalvarVeiculo} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Veículo'}
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Notificação */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>
              Configure como você deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="novas-entregas">Novas Entregas</Label>
                  <p className="text-sm text-gray-500">Receber notificações de novas entregas disponíveis</p>
                </div>
                <Switch
                  id="novas-entregas"
                  checked={notificacoes.novas_entregas}
                  onCheckedChange={(checked) => 
                    setNotificacoes({...notificacoes, novas_entregas: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mensagens-cliente">Mensagens do Cliente</Label>
                  <p className="text-sm text-gray-500">Receber notificações de mensagens dos clientes</p>
                </div>
                <Switch
                  id="mensagens-cliente"
                  checked={notificacoes.mensagens_cliente}
                  onCheckedChange={(checked) => 
                    setNotificacoes({...notificacoes, mensagens_cliente: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="atualizacoes-sistema">Atualizações do Sistema</Label>
                  <p className="text-sm text-gray-500">Receber notificações sobre atualizações</p>
                </div>
                <Switch
                  id="atualizacoes-sistema"
                  checked={notificacoes.atualizacoes_sistema}
                  onCheckedChange={(checked) => 
                    setNotificacoes({...notificacoes, atualizacoes_sistema: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="promocoes">Promoções</Label>
                  <p className="text-sm text-gray-500">Receber notificações sobre promoções e ofertas</p>
                </div>
                <Switch
                  id="promocoes"
                  checked={notificacoes.promocoes}
                  onCheckedChange={(checked) => 
                    setNotificacoes({...notificacoes, promocoes: checked})
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Disponibilidade */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Disponibilidade</CardTitle>
            </div>
            <CardDescription>
              Configure suas preferências de trabalho
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Status Atual</Label>
              <Select
                value={disponibilidade.status}
                onValueChange={(value) => setDisponibilidade({...disponibilidade, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="ocupado">Ocupado</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="raio">Raio de Entrega (km)</Label>
              <Select
                value={disponibilidade.raio_entrega}
                onValueChange={(value) => setDisponibilidade({...disponibilidade, raio_entrega: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="15">15 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="aceitar-automatico">Aceitar Entregas Automaticamente</Label>
                <p className="text-sm text-gray-500">Aceitar automaticamente entregas dentro do seu raio</p>
              </div>
              <Switch
                id="aceitar-automatico"
                checked={disponibilidade.aceitar_automatico}
                onCheckedChange={(checked) => 
                  setDisponibilidade({...disponibilidade, aceitar_automatico: checked})
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}