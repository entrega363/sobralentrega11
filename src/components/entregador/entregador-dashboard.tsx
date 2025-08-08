'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConnectionStatus } from '@/components/realtime/connection-status'
import { usePedidos } from '@/hooks/use-supabase'
import { useRealtimeEntregas } from '@/hooks/use-realtime-sync'
import { useAuthSelectors } from '@/stores/auth-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Truck, Clock, CheckCircle, MapPin, Phone } from 'lucide-react'

export function EntregadorDashboard() {
  const { profile, user } = useAuthSelectors()
  const { data: pedidos = [], isLoading, error } = usePedidos()
  
  // Debug: mostrar dados no console
  console.log('EntregadorDashboard - pedidos:', pedidos)
  console.log('EntregadorDashboard - user:', user)
  console.log('EntregadorDashboard - profile:', profile)

  // Filtrar pedidos disponíveis para entrega
  const pedidosDisponiveis = Array.isArray(pedidos) ? pedidos.filter((p: any) => 
    p.status === 'pronto' && !p.entregador_id
  ) : []
  
  const minhasEntregas = Array.isArray(pedidos) ? pedidos.filter((p: any) => 
    p.entregador_id === profile?.id
  ) : []

  const entregasHoje = minhasEntregas.filter((p: any) => {
    const hoje = new Date().toDateString()
    return new Date(p.created_at).toDateString() === hoje
  })

  const ganhosDia = entregasHoje
    .filter((p: any) => p.status === 'entregue')
    .reduce((sum: number, p: any) => sum + (p.taxa_entrega || 5), 0) // Taxa padrão de R$ 5

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sobral-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando entregas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Erro desconhecido'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard do Entregador</h1>
        <p className="text-gray-600">
          Gerencie suas entregas e ganhos
        </p>
        <div className="mt-2">
          <ConnectionStatus />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Entregas Disponíveis</p>
                <p className="text-2xl font-bold">{pedidosDisponiveis.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Entregas Hoje</p>
                <p className="text-2xl font-bold">{entregasHoje.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Entregas</p>
                <p className="text-2xl font-bold">{minhasEntregas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-green-600">💰</div>
              <div>
                <p className="text-sm text-gray-600">Ganhos Hoje</p>
                <p className="text-2xl font-bold">{formatCurrency(ganhosDia)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entregas Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <span>Entregas Disponíveis</span>
          </CardTitle>
          <CardDescription>
            Pedidos prontos para entrega
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pedidosDisponiveis.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚛</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma entrega disponível
              </h3>
              <p className="text-gray-600">
                Novas entregas aparecerão aqui quando estiverem prontas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosDisponiveis.map((pedido: any) => (
                <div key={pedido.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">Pedido #{pedido.id.slice(-6)}</h4>
                        <Badge variant="secondary">Pronto</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{pedido.endereco_entrega?.rua}, {pedido.endereco_entrega?.numero}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{pedido.telefone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-sobral-red-600">
                        {formatCurrency(pedido.total)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Taxa: {formatCurrency(5)} {/* Taxa padrão */}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Pronto às {formatDate(pedido.updated_at)}
                    </p>
                    
                    <Button size="sm">
                      Aceitar Entrega
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minhas Entregas */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Entregas</CardTitle>
          <CardDescription>
            Entregas que você está realizando
          </CardDescription>
        </CardHeader>
        <CardContent>
          {minhasEntregas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma entrega em andamento
              </h3>
              <p className="text-gray-600">
                Aceite uma entrega disponível para começar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {minhasEntregas.slice(0, 5).map((pedido: any) => (
                <div key={pedido.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-semibold">Pedido #{pedido.id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(pedido.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(pedido.total)}</p>
                      <Badge 
                        variant={
                          pedido.status === 'saiu_entrega' ? 'secondary' :
                          pedido.status === 'entregue' ? 'default' : 'outline'
                        }
                      >
                        {pedido.status === 'saiu_entrega' ? 'Em entrega' : pedido.status}
                      </Badge>
                    </div>
                    
                    {pedido.status === 'saiu_entrega' && (
                      <Button variant="outline" size="sm">
                        Finalizar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}