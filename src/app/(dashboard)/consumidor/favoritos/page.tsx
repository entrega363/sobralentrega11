'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthSelectors } from '@/stores/auth-store'
import { formatCurrency } from '@/lib/utils'
import { Heart, Trash2, RefreshCw, Store, Package, ShoppingCart } from 'lucide-react'

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removendoId, setRemovendoId] = useState<string | null>(null)
  const { user } = useAuthSelectors()

  const carregarFavoritos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Por enquanto, vamos simular dados até implementar a API
      // TODO: Implementar chamada real para API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular loading
      
      // Dados simulados
      const favoritosSimulados = [
        {
          id: '1',
          tipo: 'produto',
          created_at: '2024-01-15T18:30:00Z',
          produto: {
            id: 'prod1',
            nome: 'Pizza Margherita',
            descricao: 'Pizza tradicional com molho de tomate, mussarela e manjericão',
            preco: 32.90,
            categoria: 'Pizza',
            imagem_url: null,
            empresa: {
              nome: 'Pizzaria do João',
              categoria: 'Pizzaria'
            }
          }
        },
        {
          id: '2',
          tipo: 'empresa',
          created_at: '2024-01-14T12:15:00Z',
          empresa: {
            id: 'emp1',
            nome: 'Burger House',
            categoria: 'Hamburgueria',
            endereco: {
              rua: 'Av. Principal, 789',
              bairro: 'Centro'
            },
            configuracoes: {
              tempo_entrega_medio: 30,
              taxa_entrega: 5.00
            }
          }
        },
        {
          id: '3',
          tipo: 'produto',
          created_at: '2024-01-13T20:45:00Z',
          produto: {
            id: 'prod2',
            nome: 'Açaí 500ml',
            descricao: 'Açaí cremoso com granola, banana e leite condensado',
            preco: 15.50,
            categoria: 'Açaí',
            imagem_url: null,
            empresa: {
              nome: 'Açaí da Praia',
              categoria: 'Açaí'
            }
          }
        }
      ]
      
      setFavoritos(favoritosSimulados)
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err)
      setError('Erro ao carregar favoritos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const removerFavorito = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item dos favoritos?')) {
      return
    }

    try {
      setRemovendoId(id)
      
      // TODO: Implementar chamada real para API
      await new Promise(resolve => setTimeout(resolve, 500)) // Simular loading
      
      setFavoritos(favoritos.filter(fav => fav.id !== id))
    } catch (err) {
      console.error('Erro ao remover favorito:', err)
      alert('Erro ao remover favorito. Tente novamente.')
    } finally {
      setRemovendoId(null)
    }
  }

  useEffect(() => {
    carregarFavoritos()
  }, [])

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando seus favoritos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Favoritos</h1>
          <p className="text-gray-600">Seus produtos e restaurantes favoritos</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao carregar favoritos
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={carregarFavoritos}>
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
          <h1 className="text-2xl font-bold">Favoritos</h1>
          <p className="text-gray-600">Seus produtos e restaurantes favoritos</p>
        </div>
        
        <Button variant="outline" onClick={carregarFavoritos}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {favoritos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum favorito encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Você ainda não favoritou nenhum produto ou restaurante. Explore nosso marketplace!
          </p>
          <Button>
            <Heart className="h-4 w-4 mr-2" />
            Explorar Marketplace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritos.map((favorito) => (
            <Card key={favorito.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {favorito.tipo === 'produto' ? (
                      <Package className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Store className="h-5 w-5 text-green-500" />
                    )}
                    <Badge variant="outline">
                      {favorito.tipo === 'produto' ? 'Produto' : 'Restaurante'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removerFavorito(favorito.id)}
                    disabled={removendoId === favorito.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {removendoId === favorito.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {favorito.tipo === 'produto' ? (
                  // Card de Produto
                  <>
                    <div>
                      <CardTitle className="text-lg">{favorito.produto.nome}</CardTitle>
                      <CardDescription className="text-sm">
                        {favorito.produto.empresa.nome}
                      </CardDescription>
                    </div>
                    
                    {favorito.produto.descricao && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {favorito.produto.descricao}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(favorito.produto.preco)}
                      </div>
                      <Badge variant="secondary">{favorito.produto.categoria}</Badge>
                    </div>
                    
                    <Button className="w-full" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </>
                ) : (
                  // Card de Empresa
                  <>
                    <div>
                      <CardTitle className="text-lg">{favorito.empresa.nome}</CardTitle>
                      <CardDescription className="text-sm">
                        {favorito.empresa.categoria}
                      </CardDescription>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>{favorito.empresa.endereco.rua}</p>
                      <p>{favorito.empresa.endereco.bairro}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Entrega: ~{favorito.empresa.configuracoes.tempo_entrega_medio}min</span>
                      <span>Taxa: {formatCurrency(favorito.empresa.configuracoes.taxa_entrega)}</span>
                    </div>
                    
                    <Button className="w-full" size="sm" variant="outline">
                      <Store className="h-4 w-4 mr-2" />
                      Ver Cardápio
                    </Button>
                  </>
                )}
                
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Favoritado em {formatarData(favorito.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}