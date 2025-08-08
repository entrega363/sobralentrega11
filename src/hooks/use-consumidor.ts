import { useState, useEffect } from 'react'
import { useAuthSelectors } from '@/stores/auth-store'

// Tipos para os dados do consumidor
export interface Pedido {
  id: string
  consumidor_id: string
  status: 'pendente' | 'aceito' | 'preparando' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado' | 'recusado'
  total: number
  created_at: string
  endereco_entrega: {
    rua: string
    numero?: string
    complemento?: string
    bairro: string
    cidade: string
    cep?: string
  }
  pedido_itens: PedidoItem[]
}

export interface PedidoItem {
  id: string
  pedido_id: string
  produto_id: string
  quantidade: number
  preco_unitario: number
  produto: {
    nome: string
    empresa: {
      nome: string
    }
  }
}

export interface Favorito {
  id: string
  consumidor_id: string
  produto_id?: string
  empresa_id?: string
  tipo: 'produto' | 'empresa'
  created_at: string
  produto?: {
    id: string
    nome: string
    descricao: string
    preco: number
    categoria: string
    imagem_url?: string
    empresa: {
      nome: string
      categoria: string
    }
  }
  empresa?: {
    id: string
    nome: string
    categoria: string
    endereco: {
      rua: string
      bairro: string
    }
    configuracoes: {
      tempo_entrega_medio: number
      taxa_entrega: number
    }
  }
}

export interface ConsumidorData {
  id: string
  profile_id: string
  nome: string
  cpf: string
  telefone: string
  endereco: {
    rua: string
    numero?: string
    complemento?: string
    bairro: string
    cidade: string
    cep?: string
  }
}

// Hook para pedidos do consumidor
export function usePedidosConsumidor() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthSelectors()

  const carregarPedidos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Substituir por chamada real à API
      // const response = await fetch('/api/consumidor/pedidos')
      // const data = await response.json()
      
      // Dados simulados por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const pedidosSimulados: Pedido[] = [
        {
          id: '1',
          consumidor_id: user?.id || '',
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
              pedido_id: '1',
              produto_id: 'prod1',
              quantidade: 2,
              preco_unitario: 18.90,
              produto: {
                nome: 'Pizza Margherita',
                empresa: {
                  nome: 'Pizzaria do João'
                }
              }
            }
          ]
        }
      ]
      
      setPedidos(pedidosSimulados)
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError('Erro ao carregar pedidos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      carregarPedidos()
    }
  }, [user?.id])

  return {
    pedidos,
    isLoading,
    error,
    refetch: carregarPedidos
  }
}

// Hook para favoritos do consumidor
export function useFavoritosConsumidor() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthSelectors()

  const carregarFavoritos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Substituir por chamada real à API
      // const response = await fetch('/api/consumidor/favoritos')
      // const data = await response.json()
      
      // Dados simulados por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const favoritosSimulados: Favorito[] = [
        {
          id: '1',
          consumidor_id: user?.id || '',
          produto_id: 'prod1',
          tipo: 'produto',
          created_at: '2024-01-15T18:30:00Z',
          produto: {
            id: 'prod1',
            nome: 'Pizza Margherita',
            descricao: 'Pizza tradicional com molho de tomate, mussarela e manjericão',
            preco: 32.90,
            categoria: 'Pizza',
            empresa: {
              nome: 'Pizzaria do João',
              categoria: 'Pizzaria'
            }
          }
        }
      ]
      
      setFavoritos(favoritosSimulados)
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err)
      setError('Erro ao carregar favoritos')
    } finally {
      setIsLoading(false)
    }
  }

  const removerFavorito = async (id: string) => {
    try {
      // TODO: Substituir por chamada real à API
      // await fetch(`/api/consumidor/favoritos/${id}`, { method: 'DELETE' })
      
      // Simulação por enquanto
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setFavoritos(prev => prev.filter(fav => fav.id !== id))
      return true
    } catch (err) {
      console.error('Erro ao remover favorito:', err)
      throw new Error('Erro ao remover favorito')
    }
  }

  useEffect(() => {
    if (user?.id) {
      carregarFavoritos()
    }
  }, [user?.id])

  return {
    favoritos,
    isLoading,
    error,
    refetch: carregarFavoritos,
    removerFavorito
  }
}

// Hook para dados do consumidor
export function useConsumidorData() {
  const [consumidor, setConsumidor] = useState<ConsumidorData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthSelectors()

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Substituir por chamada real à API
      // const response = await fetch('/api/consumidor/dados')
      // const data = await response.json()
      
      // Dados simulados por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const dadosSimulados: ConsumidorData = {
        id: 'cons1',
        profile_id: user?.id || '',
        nome: 'João Silva',
        cpf: '123.456.789-00',
        telefone: '(88) 99999-9999',
        endereco: {
          rua: 'Rua das Flores',
          numero: '123',
          complemento: 'Apt 101',
          bairro: 'Centro',
          cidade: 'Sobral',
          cep: '62010-000'
        }
      }
      
      setConsumidor(dadosSimulados)
    } catch (err) {
      console.error('Erro ao carregar dados do consumidor:', err)
      setError('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const atualizarDados = async (dados: Partial<ConsumidorData>) => {
    try {
      // TODO: Substituir por chamada real à API
      // const response = await fetch('/api/consumidor/dados', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dados)
      // })
      // const dadosAtualizados = await response.json()
      
      // Simulação por enquanto
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setConsumidor(prev => prev ? { ...prev, ...dados } : null)
      return true
    } catch (err) {
      console.error('Erro ao atualizar dados:', err)
      throw new Error('Erro ao salvar dados')
    }
  }

  useEffect(() => {
    if (user?.id) {
      carregarDados()
    }
  }, [user?.id])

  return {
    consumidor,
    isLoading,
    error,
    refetch: carregarDados,
    atualizarDados
  }
}