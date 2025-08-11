'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConviteEntregadorModal } from '@/components/empresa/convite-entregador-modal'
import { Plus, Truck, Clock, TrendingUp, UserPlus, MessageSquare, Power } from 'lucide-react'

interface EntregadorFixo {
  id: string
  nome: string
  email: string
  telefone: string
  status: 'ativo' | 'inativo'
  statusDisponibilidade: 'disponivel_empresa' | 'indisponivel_empresa' | 'disponivel_sistema'
  dataVinculo: string
  totalEntregas: number
  avaliacaoMedia: number
  ultimaEntrega?: string
}

export default function EntregadoresFixosPage() {
  const [showModal, setShowModal] = useState(false)
  
  // Dados mock para demonstração
  const [entregadoresFixos, setEntregadoresFixos] = useState<EntregadorFixo[]>([
    {
      id: '1',
      nome: 'Carlos Silva',
      email: 'carlos@email.com',
      telefone: '(85) 99999-1111',
      status: 'ativo',
      statusDisponibilidade: 'disponivel_empresa',
      dataVinculo: '2024-01-10T10:00:00Z',
      totalEntregas: 45,
      avaliacaoMedia: 4.8,
      ultimaEntrega: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      nome: 'Ana Santos',
      email: 'ana@email.com',
      telefone: '(85) 99999-2222',
      status: 'ativo',
      statusDisponibilidade: 'indisponivel_empresa',
      dataVinculo: '2024-01-05T15:00:00Z',
      totalEntregas: 32,
      avaliacaoMedia: 4.6,
      ultimaEntrega: '2024-01-14T16:45:00Z'
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      email: 'pedro@email.com',
      telefone: '(85) 99999-3333',
      status: 'inativo',
      statusDisponibilidade: 'disponivel_sistema',
      dataVinculo: '2024-01-01T12:00:00Z',
      totalEntregas: 28,
      avaliacaoMedia: 4.9
    }
  ])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      ativo: { variant: 'default' as const, label: 'Ativo' },
      inativo: { variant: 'secondary' as const, label: 'Inativo' }
    }
    
    const statusConfig = config[status as keyof typeof config] || config.ativo
    return (
      <Badge variant={statusConfig.variant}>
        {statusConfig.label}
      </Badge>
    )
  }

  const getDisponibilidadeBadge = (disponibilidade: string) => {
    const config = {
      disponivel_empresa: { variant: 'default' as const, label: 'Disponível para Empresa', color: 'bg-green-100 text-green-800' },
      indisponivel_empresa: { variant: 'secondary' as const, label: 'Indisponível para Empresa', color: 'bg-yellow-100 text-yellow-800' },
      disponivel_sistema: { variant: 'outline' as const, label: 'Disponível para Sistema', color: 'bg-blue-100 text-blue-800' }
    }
    
    const statusConfig = config[disponibilidade as keyof typeof config] || config.disponivel_empresa
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    )
  }

  const handleConviteEnviado = () => {
    // Atualizar lista após enviar convite
    console.log('Convite enviado, atualizando lista...')
    setShowModal(false)
  }

  const handleDesvincular = (entregadorId: string) => {
    setEntregadoresFixos(prev => prev.filter(e => e.id !== entregadorId))
  }

  const entregadoresAtivos = entregadoresFixos.filter(e => e.status === 'ativo')
  const entregadoresDisponiveis = entregadoresFixos.filter(e => e.statusDisponibilidade === 'disponivel_empresa')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entregadores Fixos</h1>
          <p className="text-gray-600">Gerencie sua equipe dedicada de entregadores</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-sobral-red-600 hover:bg-sobral-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Convidar Entregador
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entregadores</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entregadoresFixos.length}</div>
            <p className="text-xs text-muted-foreground">
              {entregadoresAtivos.length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entregadoresDisponiveis.length}</div>
            <p className="text-xs text-muted-foreground">
              Para suas entregas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entregadoresFixos.reduce((acc, e) => acc + (e.ultimaEntrega ? 1 : 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entregadoresFixos.length > 0 
                ? (entregadoresFixos.reduce((acc, e) => acc + e.avaliacaoMedia, 0) / entregadoresFixos.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              ⭐ Estrelas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entregadores List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entregadoresFixos.map((entregador) => (
          <Card key={entregador.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{entregador.nome}</CardTitle>
                  <CardDescription>{entregador.email}</CardDescription>
                  <CardDescription>{entregador.telefone}</CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(entregador.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Status de Disponibilidade:</p>
                {getDisponibilidadeBadge(entregador.statusDisponibilidade)}
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vinculado em:</span>
                <span className="font-medium">
                  {formatDate(entregador.dataVinculo)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total de entregas:</span>
                <span className="font-medium">{entregador.totalEntregas}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avaliação:</span>
                <span className="font-medium">⭐ {entregador.avaliacaoMedia}</span>
              </div>

              {entregador.ultimaEntrega && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última entrega:</span>
                  <span className="font-medium">
                    {formatDateTime(entregador.ultimaEntrega)}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Chat
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDesvincular(entregador.id)}
                >
                  <Power className="h-3 w-3 mr-1" />
                  Desvincular
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {entregadoresFixos.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum entregador fixo
            </h3>
            <p className="text-gray-600 mb-4">
              Convide entregadores para formar sua equipe dedicada de entregas.
            </p>
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-sobral-red-600 hover:bg-sobral-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Convidar Primeiro Entregador
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Convite */}
      <ConviteEntregadorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        empresaId="empresa-id" // Será obtido do contexto
        onConviteEnviado={handleConviteEnviado}
      />
    </div>
  )
}