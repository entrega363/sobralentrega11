'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConnectionStatus } from '@/components/realtime/connection-status'
import { useProdutos, useEmpresas } from '@/hooks/use-supabase'
import { useAuthSelectors } from '@/stores/auth-store'
import { formatCurrency } from '@/lib/utils'
import { Search, ShoppingCart, Clock } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'

export function ConsumidorDashboard() {
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const { profile } = useAuthSelectors()
  const { addItem } = useCartStore()
  
  const { data: produtos = [], isLoading: loadingProdutos, error: errorProdutos } = useProdutos()
  const { data: empresas = [], isLoading: loadingEmpresas, error: errorEmpresas } = useEmpresas()

  // Debug: mostrar dados no console
  console.log('ConsumidorDashboard - produtos:', produtos)
  console.log('ConsumidorDashboard - empresas:', empresas)
  console.log('ConsumidorDashboard - profile:', profile)

  // Filtrar produtos
  const produtosFiltrados = Array.isArray(produtos) ? produtos.filter((produto: any) => {
    const matchBusca = !busca || 
      produto.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      produto.empresas?.nome?.toLowerCase().includes(busca.toLowerCase())
    
    const matchCategoria = !filtroCategoria || produto.categoria === filtroCategoria
    
    return matchBusca && matchCategoria
  }) : []

  // Obter categorias únicas
  const categorias = Array.isArray(produtos) ? Array.from(new Set(produtos.map((p: any) => p.categoria).filter(Boolean))) : []

  if (loadingProdutos || loadingEmpresas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sobral-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  if (errorProdutos || errorEmpresas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-gray-600 mb-4">
            {errorProdutos?.message || errorEmpresas?.message || 'Erro desconhecido'}
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
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600">
          Descubra os melhores restaurantes de Sobral
        </p>
        <div className="mt-2">
          <ConnectionStatus />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar produtos ou restaurantes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sobral-red-500"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((categoria: any) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🏪</div>
              <div>
                <p className="text-sm text-gray-600">Restaurantes</p>
                <p className="text-xl font-semibold">{empresas?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🍕</div>
              <div>
                <p className="text-sm text-gray-600">Produtos</p>
                <p className="text-xl font-semibold">{produtos?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">📦</div>
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-xl font-semibold">{categorias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtosFiltrados.map((produto: any) => (
          <Card key={produto.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            {/* Imagem do Produto */}
            <div className="relative h-48 bg-gray-100">
              {produto.imagem_url ? (
                <img
                  src={produto.imagem_url}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback para imagem padrão se a URL falhar
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-food.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p className="text-sm text-gray-500">Sem imagem</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-700">
                  {produto.categoria}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{produto.nome}</CardTitle>
                  <CardDescription className="text-sm">
                    {produto.empresas?.nome}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {produto.descricao && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {produto.descricao}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-sobral-red-600">
                  {formatCurrency(produto.preco)}
                </div>
                
                {produto.tempo_preparacao && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {produto.tempo_preparacao}min
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => addItem(produto)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {produtosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou buscar por outros termos
          </p>
        </div>
      )}
    </div>
  )
}