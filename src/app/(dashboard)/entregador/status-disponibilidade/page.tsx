'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusDisponibilidadeComponent } from '@/components/entregador/status-disponibilidade'
import { ConvitesPendentes } from '@/components/entregador/convites-pendentes'
import { Settings, Bell, Truck, Building2 } from 'lucide-react'

interface EntregadorData {
  id: string
  nome: string
  statusDisponibilidade: 'disponivel_sistema' | 'disponivel_empresa' | 'indisponivel_empresa' | 'indisponivel_total'
  empresaVinculada?: {
    id: string
    nome: string
    endereco?: string
    avaliacaoMedia?: number
  }
}

interface ConvitePendente {
  id: string
  empresa: {
    id: string
    nome: string
    endereco: string
    avaliacaoMedia: number
  }
  dataConvite: string
  mensagem?: string
}

export default function StatusDisponibilidadePage() {
  // Dados mock para demonstração
  const [entregadorData, setEntregadorData] = useState<EntregadorData>({
    id: '1',
    nome: 'João Silva',
    statusDisponibilidade: 'disponivel_sistema',
    empresaVinculada: undefined
  })

  const [convitesPendentes, setConvitesPendentes] = useState<ConvitePendente[]>([
    {
      id: '1',
      empresa: {
        id: '1',
        nome: 'Restaurante Sabor & Arte',
        endereco: 'Rua das Flores, 123 - Centro',
        avaliacaoMedia: 4.8
      },
      dataConvite: '2024-01-15T10:00:00Z',
      mensagem: 'Gostaríamos de ter você em nossa equipe fixa de entregadores!'
    },
    {
      id: '2',
      empresa: {
        id: '2',
        nome: 'Pizzaria Bella Vista',
        endereco: 'Av. Principal, 456 - Bairro Novo',
        avaliacaoMedia: 4.6
      },
      dataConvite: '2024-01-14T15:30:00Z'
    }
  ])

  const handleStatusChange = (novoStatus: string) => {
    setEntregadorData(prev => ({
      ...prev,
      statusDisponibilidade: novoStatus as any
    }))
  }

  const handleConviteResposta = (conviteId: string, aceitar: boolean) => {
    const convite = convitesPendentes.find(c => c.id === conviteId)
    if (!convite) return

    if (aceitar) {
      // Aceitar convite - vincular à empresa
      setEntregadorData(prev => ({
        ...prev,
        statusDisponibilidade: 'disponivel_empresa',
        empresaVinculada: convite.empresa
      }))
    }

    // Remover convite da lista
    setConvitesPendentes(prev => prev.filter(c => c.id !== conviteId))
  }

  const getStatusDescription = (status: string) => {
    const descriptions = {
      disponivel_sistema: 'Você está disponível para receber entregas de todas as empresas do sistema.',
      disponivel_empresa: 'Você está trabalhando exclusivamente para uma empresa específica.',
      indisponivel_empresa: 'Você está temporariamente indisponível para sua empresa fixa.',
      indisponivel_total: 'Você está completamente indisponível para entregas.'
    }
    return descriptions[status as keyof typeof descriptions] || ''
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Status de Disponibilidade</h1>
        <p className="text-gray-600">Gerencie sua disponibilidade e vínculos com empresas</p>
      </div>

      {/* Status Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status Atual
          </CardTitle>
          <CardDescription>
            {getStatusDescription(entregadorData.statusDisponibilidade)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusDisponibilidadeComponent
            entregadorId={entregadorData.id}
            statusAtual={entregadorData.statusDisponibilidade}
            empresaVinculada={entregadorData.empresaVinculada}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      {/* Empresa Vinculada */}
      {entregadorData.empresaVinculada && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresa Vinculada
            </CardTitle>
            <CardDescription>
              Informações da empresa à qual você está vinculado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{entregadorData.empresaVinculada.nome}</h3>
                {entregadorData.empresaVinculada.endereco && (
                  <p className="text-sm text-gray-600">{entregadorData.empresaVinculada.endereco}</p>
                )}
                {entregadorData.empresaVinculada.avaliacaoMedia && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Avaliação:</span>
                    <Badge variant="outline">
                      ⭐ {entregadorData.empresaVinculada.avaliacaoMedia}
                    </Badge>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Convites Pendentes */}
      {convitesPendentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Convites Pendentes
              <Badge variant="secondary">{convitesPendentes.length}</Badge>
            </CardTitle>
            <CardDescription>
              Você tem convites de empresas para se tornar entregador fixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConvitesPendentes
              convites={convitesPendentes}
              onResposta={handleConviteResposta}
            />
          </CardContent>
        </Card>
      )}

      {/* Histórico de Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Histórico de Mudanças
          </CardTitle>
          <CardDescription>
            Últimas alterações no seu status de disponibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="text-sm font-medium">Disponível para Sistema</p>
                <p className="text-xs text-gray-500">15/01/2024 às 10:30</p>
              </div>
              <Badge variant="outline">Atual</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="text-sm font-medium">Indisponível Total</p>
                <p className="text-xs text-gray-500">14/01/2024 às 18:00</p>
              </div>
              <span className="text-xs text-gray-400">Anterior</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Disponível para Empresa</p>
                <p className="text-xs text-gray-500">14/01/2024 às 08:00</p>
              </div>
              <span className="text-xs text-gray-400">Anterior</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}