'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthSelectors } from '@/stores/auth-store'
import { formatCurrency } from '@/lib/utils'
import { Clock, MapPin, Package, RefreshCw } from 'lucide-react'

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
  const [pedidos, setPedidos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthSelectors()

  const carregarPedidos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Por enquanto, vamos simular dados até implementar a API
      // TODO: Implementar chamada real para API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular loading
      
      // Dados simulados
      const pedidosSimulados = [
        {
          id: '1',
          status: 'entregue',
          total: 45.90,
          created_at: '2024-01-15T18:30:00Z',
          endereco_entrega: {
            rua: 'Rua das Flores, 123',
            bairro: 'Centro',
            cidade: 'Sobral'
          },
          pedido_itens: [
            {
              id: '1',
              quantidade: 2,
              preco_unitario: 18.90,
              produto: {
                nome: 'Pizza Margherita',
                empresa: {
                  nome: 'Pizzaria do João'
                }
              }
            },
            {
              id: '2',
              quantidade: 1,
              preco_unitario: 8.10,
              produto: {
                nome: 'Refrigerante 2L',
                empresa: {
                  nome: 'Pizzaria do João'
                }
              }
            }
          ]
        },
        {
          id: '2',
          status: 'preparando',
          total: 32.50,
          created_at: '2024-01-16T12:15:00Z',
          endereco_entrega: {
            rua: 'Av. Principal, 456',
            bairro: 'Cidade Dr. José Euclides',
            cidade: 'Sobral'
          },
          pedido_itens: [
            {
              id: '3',
              quantidade: 1,
              preco_unitario: 25.00,
              produto: {
                nome: 'Hambúrguer Especial',
                empresa: {
                  nome: 'Burger House'
                }
              }
            },
            {
              id: '4',
              quantidade: 1,
              preco_unitario: 7.50,
              produto: {
                nome: 'Batata Frita',
                empresa: {
                  nome: 'Burger House'
                }
              }
            }
          ]
        }
      ]
      
      setPedidos(pedidosSimulados)
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError('Erro ao carregar pedidos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarPedidos()
  }, [])

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando seus pedidos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Meus Pedidos</h1>
          <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao carregar pedidos
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={carregarPedidos}>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Meus Pedidos</h1>
          <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
        </div>
        
        <Button variant="outline" onClick={carregarPedidos}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Você ainda não fez nenhum pedido. Que tal explorar nossos restaurantes?
          </p>
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Explorar Restaurantes
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Pedido #{pedido.id}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      {formatarData(pedido.created_at)}
                    </CardDescription>
                  </div>
                  <Badge 
                    className={statusColors[pedido.status as keyof typeof statusColors]}
                  >
                    {statusLabels[pedido.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Endereço de entrega */}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                  <div className="text-sm text-gray-600">
                    <p>{pedido.endereco_entrega.rua}</p>
                    <p>{pedido.endereco_entrega.bairro}, {pedido.endereco_entrega.cidade}</p>
                  </div>
                </div>

                {/* Itens do pedido */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Itens do pedido:</h4>
                  {pedido.pedido_itens.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <div>
                        <p className="font-medium">{item.produto.nome}</p>
                        <p className="text-gray-600 text-xs">{item.produto.empresa.nome}</p>
                      </div>
                      <div className="text-right">
                        <p>{item.quantidade}x {formatCurrency(item.preco_unitario)}</p>
                        <p className="font-medium">{formatCurrency(item.quantidade * item.preco_unitario)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(pedido.total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}