'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConnectionStatus } from '@/components/realtime/connection-status'
import { useProdutos, usePedidos } from '@/hooks/use-supabase'
import { useRealtimePedidos } from '@/hooks/use-realtime-sync'
import { useAuthSelectors } from '@/stores/auth-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react'

export function EmpresaDashboard() {
  const { profile, user } = useAuthSelectors()
  
  // Buscar dados da empresa
  const { data: produtos = [], isLoading: loadingProdutos, error: errorProdutos } = useProdutos()
  const { data: pedidos = [], isLoading: loadingPedidos, error: errorPedidos } = usePedidos()

  // Debug: mostrar dados no console
  console.log('EmpresaDashboard - produtos:', produtos)
  console.log('EmpresaDashboard - pedidos:', pedidos)
  console.log('EmpresaDashboard - user:', user)
  console.log('EmpresaDashboard - profile:', profile)

  // Estatísticas básicas
  const produtosAtivos = Array.isArray(produtos) ? produtos.filter((p: any) => p.disponivel).length : 0
  const pedidosPendentes = Array.isArray(pedidos) ? pedidos.filter((p: any) => p.status === 'pendente').length : 0
  const receitaTotal = Array.isArray(pedidos) ? pedidos
    .filter((p: any) => p.status === 'entregue')
    .reduce((sum: number, p: any) => sum + (p.total || 0), 0) : 0

  if (loadingProdutos || loadingPedidos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sobral-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (errorProdutos || errorPedidos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-gray-600 mb-4">
            {errorProdutos?.message || errorPedidos?.message || 'Erro desconhecido'}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Gerencie seus produtos e pedidos
          </p>
          <div className="mt-2">
            <ConnectionStatus />
          </div>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Produtos Ativos</p>
                <p className="text-2xl font-bold">{produtosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pedidos Pendentes</p>
                <p className="text-2xl font-bold">{pedidosPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">{pedidos?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-sobral-red-600" />
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(receitaTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>
            Últimos pedidos recebidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pedidos || pedidos.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum pedido ainda
              </h3>
              <p className="text-gray-600">
                Seus pedidos aparecerão aqui quando chegarem
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos?.slice(0, 5).map((pedido: any) => (
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
                          pedido.status === 'pendente' ? 'secondary' :
                          pedido.status === 'entregue' ? 'default' : 'outline'
                        }
                      >
                        {pedido.status}
                      </Badge>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Produtos em Destaque */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos em Destaque</CardTitle>
          <CardDescription>
            Seus produtos mais populares
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!produtos || produtos.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🍕</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando seus primeiros produtos
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Produto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtos?.slice(0, 6).map((produto: any) => (
                <div key={produto.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{produto.nome}</h4>
                    <Badge variant={produto.disponivel ? 'default' : 'secondary'}>
                      {produto.disponivel ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{produto.categoria}</p>
                  <p className="text-lg font-bold text-sobral-red-600">
                    {formatCurrency(produto.preco)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}