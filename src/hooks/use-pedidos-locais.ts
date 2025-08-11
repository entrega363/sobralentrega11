'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { PedidoLocal, CriarPedidoLocalData } from '@/types/garcom'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  categoria?: string
  disponivel: boolean
  imagem_url?: string
  tempo_preparo?: number
}

export function usePedidosLocais() {
  const [pedidos, setPedidos] = useState<PedidoLocal[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadPedidos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('garcom_token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/comanda/pedidos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.')
        }
        throw new Error('Erro ao carregar pedidos')
      }
      
      const data = await response.json()
      setPedidos(data.pedidos || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadProdutos = async (filtros?: { categoria?: string; search?: string; disponivel?: boolean }) => {
    try {
      setLoadingProdutos(true)
      
      const token = localStorage.getItem('garcom_token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const params = new URLSearchParams()
      if (filtros?.categoria) params.append('categoria', filtros.categoria)
      if (filtros?.search) params.append('search', filtros.search)
      if (filtros?.disponivel !== undefined) params.append('disponivel', filtros.disponivel.toString())

      const response = await fetch(`/api/comanda/produtos?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }
      
      const data = await response.json()
      setProdutos(data.produtos || [])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoadingProdutos(false)
    }
  }

  const criarPedido = async (dadosPedido: CriarPedidoLocalData): Promise<PedidoLocal | null> => {
    try {
      const token = localStorage.getItem('garcom_token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/comanda/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dadosPedido),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pedido')
      }

      const data = await response.json()
      const novoPedido = data.pedido

      // Adicionar o novo pedido à lista local
      setPedidos(prev => [novoPedido, ...prev])

      toast({
        title: 'Sucesso',
        description: `Pedido ${novoPedido.numero} criado com sucesso`,
      })

      return novoPedido
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar pedido'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    }
  }

  const atualizarPedido = async (
    pedidoId: string, 
    dados: { observacoes_garcom?: string; status?: string }
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('garcom_token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch(`/api/comanda/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar pedido')
      }

      const data = await response.json()
      const pedidoAtualizado = data.pedido

      // Atualizar o pedido na lista local
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? pedidoAtualizado : p
      ))

      toast({
        title: 'Sucesso',
        description: data.message || 'Pedido atualizado com sucesso',
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar pedido'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    }
  }

  const cancelarPedido = async (pedidoId: string): Promise<boolean> => {
    return atualizarPedido(pedidoId, { status: 'cancelado' })
  }

  const buscarPedido = async (pedidoId: string): Promise<PedidoLocal | null> => {
    try {
      const token = localStorage.getItem('garcom_token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch(`/api/comanda/pedidos/${pedidoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar pedido')
      }

      const data = await response.json()
      return data.pedido
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar pedido'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    }
  }

  // Carregar pedidos na inicialização
  useEffect(() => {
    loadPedidos()
  }, [])

  return {
    // Estados
    pedidos,
    produtos,
    loading,
    loadingProdutos,
    error,
    
    // Ações
    loadPedidos,
    loadProdutos,
    criarPedido,
    atualizarPedido,
    cancelarPedido,
    buscarPedido,
    
    // Estatísticas calculadas
    totalPedidos: pedidos.length,
    pedidosPendentes: pedidos.filter(p => p.status === 'pendente').length,
    pedidosPreparando: pedidos.filter(p => p.status === 'preparando').length,
    pedidosProntos: pedidos.filter(p => p.status === 'pronto').length,
    totalVendas: pedidos.reduce((acc, p) => acc + p.total, 0),
  }
}