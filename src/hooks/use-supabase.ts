'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthSelectors } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'

// Configurações de cache
const CACHE_TIME = {
  SHORT: 5 * 60 * 1000, // 5 minutos
  MEDIUM: 15 * 60 * 1000, // 15 minutos
  LONG: 60 * 60 * 1000, // 1 hora
}

// Utilitário para fazer requests autenticadas
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro na requisição')
  }

  return response.json()
}

// Hook para buscar empresas
export function useEmpresas(filters?: { status?: string; categoria?: string }) {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.categoria) params.append('categoria', filters.categoria)
  
  return useQuery({
    queryKey: ['empresas', filters],
    queryFn: () => apiRequest(`/empresas?${params.toString()}`),
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

// Hook para buscar produtos
export function useProdutos(filters?: { 
  empresaId?: string
  categoria?: string
  disponivel?: boolean
}) {
  const params = new URLSearchParams()
  if (filters?.empresaId) params.append('empresa_id', filters.empresaId)
  if (filters?.categoria) params.append('categoria', filters.categoria)
  if (filters?.disponivel !== undefined) params.append('disponivel', filters.disponivel.toString())
  
  return useQuery({
    queryKey: ['produtos', filters],
    queryFn: () => apiRequest(`/produtos?${params.toString()}`),
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
  })
}

// Hook para buscar um produto específico
export function useProduto(id: string) {
  return useQuery({
    queryKey: ['produto', id],
    queryFn: () => apiRequest(`/produtos/${id}`),
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!id,
  })
}

// Hook para buscar pedidos
export function usePedidos(filters?: { status?: string }) {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  
  return useQuery({
    queryKey: ['pedidos', filters],
    queryFn: () => apiRequest(`/pedidos?${params.toString()}`),
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
    refetchInterval: 30000, // Refetch a cada 30 segundos para pedidos
  })
}

// Hook para criar produto
export function useCreateProduto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (produto: any) => {
      return apiRequest('/produtos', {
        method: 'POST',
        body: JSON.stringify(produto),
      })
    },
    onSuccess: (data) => {
      // Invalidar cache de produtos
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      
      // Adicionar produto ao cache otimisticamente
      queryClient.setQueryData(['produto', data.id], data)
      
      toast({
        title: 'Produto criado!',
        description: 'Produto foi criado com sucesso.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar produto',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para atualizar produto
export function useUpdateProduto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...produto }: any) => {
      return apiRequest(`/produtos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(produto),
      })
    },
    onSuccess: (data, variables) => {
      // Atualizar cache específico do produto
      queryClient.setQueryData(['produto', variables.id], data)
      
      // Invalidar lista de produtos
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      
      toast({
        title: 'Produto atualizado!',
        description: 'Produto foi atualizado com sucesso.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para deletar produto
export function useDeleteProduto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/produtos/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: (_, id) => {
      // Remover produto do cache
      queryClient.removeQueries({ queryKey: ['produto', id] })
      
      // Invalidar lista de produtos
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      
      toast({
        title: 'Produto deletado!',
        description: 'Produto foi removido com sucesso.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar produto',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para criar pedido
export function useCreatePedido() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (pedidoData: any) => {
      return apiRequest('/pedidos', {
        method: 'POST',
        body: JSON.stringify(pedidoData),
      })
    },
    onSuccess: (data) => {
      // Invalidar cache de pedidos
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      
      toast({
        title: 'Pedido criado!',
        description: `Pedido #${data.id.slice(-6)} foi criado com sucesso.`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar pedido',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para atualizar status do pedido
export function useUpdatePedidoStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status, ...data }: { id: string; status: string; [key: string]: any }) => {
      return apiRequest(`/pedidos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...data }),
      })
    },
    onSuccess: (data) => {
      // Invalidar cache de pedidos
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      
      toast({
        title: 'Status atualizado!',
        description: `Pedido #${data.id.slice(-6)} foi atualizado para ${data.status}.`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para aprovar/rejeitar empresa
export function useUpdateEmpresaStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status, motivo }: { id: string; status: string; motivo?: string }) => {
      return apiRequest(`/empresas/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, motivo }),
      })
    },
    onSuccess: (data) => {
      // Invalidar cache de empresas
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
      
      const statusTexts: Record<string, string> = {
        aprovada: 'aprovada',
        rejeitada: 'rejeitada',
        suspensa: 'suspensa',
      }
      const statusText = statusTexts[data.status] || data.status
      
      toast({
        title: 'Status da empresa atualizado!',
        description: `Empresa ${data.nome} foi ${statusText}.`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar empresa',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}