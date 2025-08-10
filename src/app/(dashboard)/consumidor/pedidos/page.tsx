'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DeliveryTracker } from '@/components/delivery/delivery-tracker'
import { RatingForm } from '@/components/ratings/rating-form'
import { useAuthSelectors } from '@/stores/auth-store'
import { usePedidosStore, useInitializeMockPedidos } from '@/stores/pedidos-store'
import { useRatings } from '@/hooks/use-ratings'
import { formatCurrency } from '@/lib/utils'
import { Clock, MapPin, Package, RefreshCw, Truck, Star } from 'lucide-react'

const statusColors = {
  pendente: 'bg-yellow-100 text-yellow-800',
  aceito: 'bg-blue-100 text-blue-800',
  preparando: 'bg-orange-100 text-orange-800',
  pronto: 'bg-green-100 text-green-800',
  saiu_entrega: 'bg-purple-100 text-purple-800',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  recusado: 'bg-red-100 text-red-800'
}

const statusLabels = {
  pendente: 'Pendente',
  aceito: 'Aceito',
  preparando: 'Preparando',
  pronto: 'Pronto',
  saiu_entrega: 'Saiu para Entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  recusado: 'Recusado'
}

export default function MeusPedidosPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avaliarPedido, setAvaliarPedido] = useState<string | null>(null)
  const { user } = useAuthSelectors()
  const { pedidos, getPedidosByConsumidor } = usePedidosStore()
  const { initializeMockData } = useInitializeMockPedidos()
  const { canRatePedido, getRatingForPedido } = useRatings()

  // Buscar pedidos do consumidor atual
  const meusPedidos = getPedidosByConsumidor(user?.id || 'consumer-1')

  const carregarPedidos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Inicializar dados mockados se não existirem
      if (pedidos.length === 0) {
        initializeMockData()
      }
      
      // Simular loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      setError('Erro ao carregar pedidos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarPedidos()
  }, [pedidos.length])

  // Combinar pedidos reais com dados simulados para demonstração
  const todosPedidos = [
    ...meusPedidos,
    // Dados simulados adicionais
    {
      id: 'mock-1',
      numero: '#003',
      consumidor_id: user?.id || 'consumer-1',
      consumidor_nome: 'Você',
      empresa_id: 'empresa-2',
      empresa_nome: 'Pizzaria do João',
      status: 'preparando' as const,
      total: 32.50,
      endereco: 'Rua das Flores, 123 - Centro',
      telefone: '(85) 99999-1111',
      itens: [
        { nome: 'Pizza Margherita', quantidade: 1, preco: 32.50 }
      ],
      created_at: '2024-01-16T12:15:00Z',
      updated_at: '2024-01-16T12:15:00Z'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={carregarPedidos}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
          <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
        </div>
        <Button onClick={carregarPedidos} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {todosPedidos.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-600">
            Você ainda não fez nenhum pedido. Que tal explorar nosso marketplace?
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {todosPedidos.map((pedido) => (
            <Card key={pedido.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Pedido {pedido.numero}
                    </CardTitle>
                    <CardDescription>
                      {pedido.empresa_nome}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[pedido.status]}>
                      {statusLabels[pedido.status]}
                    </Badge>
                    {pedido.entregador_nome && pedido.status === 'saiu_entrega' && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Truck className="h-3 w-3 mr-1" />
                        {pedido.entregador_nome}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {pedido.endereco}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(pedido.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(pedido.total)}
                    </div>
                    {pedido.entregue_em && (
                      <div className="text-sm text-gray-500">
                        Entregue em: {new Date(pedido.entregue_em).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Itens do pedido:</h4>
                  <div className="space-y-1">
                    {pedido.itens.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantidade}x {item.nome}</span>
                        <span>{formatCurrency(item.preco * item.quantidade)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rastreamento de Entrega */}
                {pedido.status === 'saiu_entrega' && (
                  <div className="border-t pt-3">
                    <DeliveryTracker 
                      pedidoId={pedido.id}
                      status={pedido.status}
                      entregadorNome={pedido.entregador_nome}
                    />
                  </div>
                )}

                {/* Avaliações */}
                {pedido.status === 'entregue' && (
                  <div className="border-t pt-3">
                    {avaliarPedido === pedido.id ? (
                      <div className="space-y-4">
                        <RatingForm
                          pedidoId={pedido.id}
                          avaliadoId={pedido.empresa_id}
                          avaliadoNome={pedido.empresa_nome}
                          tipoAvaliacao="empresa"
                          onSuccess={() => setAvaliarPedido(null)}
                        />
                        {pedido.entregador_id && (
                          <RatingForm
                            pedidoId={pedido.id}
                            avaliadoId={pedido.entregador_id}
                            avaliadoNome={pedido.entregador_nome || 'Entregador'}
                            tipoAvaliacao="entregador"
                            onSuccess={() => setAvaliarPedido(null)}
                          />
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => setAvaliarPedido(null)}
                          className="w-full"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {canRatePedido(pedido.id) ? (
                          <Button 
                            size="sm" 
                            onClick={() => setAvaliarPedido(pedido.id)}
                            className="flex-1"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Avaliar Pedido
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Star className="h-4 w-4 fill-current" />
                            Pedido já avaliado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}