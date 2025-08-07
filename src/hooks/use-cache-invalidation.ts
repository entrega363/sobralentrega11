'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export function useCacheInvalidation() {
  const queryClient = useQueryClient()

  // Invalidar cache relacionado a produtos
  const invalidateProdutos = useCallback((empresaId?: string) => {
    // Invalidar todas as queries de produtos
    queryClient.invalidateQueries({ queryKey: ['produtos'] })
    
    // Se temos empresaId específica, invalidar apenas dela
    if (empresaId) {
      queryClient.invalidateQueries({ 
        queryKey: ['produtos', { empresaId }] 
      })
    }
    
    // Invalidar produtos individuais que podem estar em cache
    queryClient.invalidateQueries({ 
      queryKey: ['produto'],
      exact: false 
    })
  }, [queryClient])

  // Invalidar cache relacionado a pedidos
  const invalidatePedidos = useCallback((filters?: { status?: string }) => {
    // Invalidar todas as queries de pedidos
    queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    
    // Se temos filtros específicos, invalidar apenas eles
    if (filters) {
      queryClient.invalidateQueries({ 
        queryKey: ['pedidos', filters] 
      })
    }
  }, [queryClient])

  // Invalidar cache relacionado a empresas
  const invalidateEmpresas = useCallback((filters?: { status?: string }) => {
    // Invalidar todas as queries de empresas
    queryClient.invalidateQueries({ queryKey: ['empresas'] })
    
    // Se temos filtros específicos, invalidar apenas eles
    if (filters) {
      queryClient.invalidateQueries({ 
        queryKey: ['empresas', filters] 
      })
    }
  }, [queryClient])

  // Invalidar cache baseado em mudanças de dados
  const invalidateRelated = useCallback((
    entity: 'produto' | 'pedido' | 'empresa',
    action: 'create' | 'update' | 'delete',
    data?: any
  ) => {
    switch (entity) {
      case 'produto':
        invalidateProdutos(data?.empresa_id)
        
        // Se produto foi criado/deletado, invalidar estatísticas da empresa
        if (action === 'create' || action === 'delete') {
          queryClient.invalidateQueries({ 
            queryKey: ['empresa-stats', data?.empresa_id] 
          })
        }
        break

      case 'pedido':
        invalidatePedidos()
        
        // Invalidar estatísticas relacionadas
        queryClient.invalidateQueries({ 
          queryKey: ['dashboard-stats'] 
        })
        
        // Se pedido foi criado, invalidar cache de produtos (para atualizar vendas)
        if (action === 'create') {
          invalidateProdutos()
        }
        break

      case 'empresa':
        invalidateEmpresas()
        
        // Se empresa foi aprovada/rejeitada, invalidar produtos relacionados
        if (action === 'update' && data?.status) {
          invalidateProdutos(data.id)
        }
        break
    }
  }, [queryClient, invalidateProdutos, invalidatePedidos, invalidateEmpresas])

  // Limpar cache específico
  const clearCache = useCallback((queryKey: string[]) => {
    queryClient.removeQueries({ queryKey })
  }, [queryClient])

  // Pré-carregar dados
  const prefetchData = useCallback(async (
    queryKey: string[],
    queryFn: () => Promise<any>,
    staleTime?: number
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: staleTime || 5 * 60 * 1000, // 5 minutos por padrão
    })
  }, [queryClient])

  // Definir dados no cache
  const setCacheData = useCallback((
    queryKey: string[],
    data: any,
    updater?: (old: any) => any
  ) => {
    if (updater) {
      queryClient.setQueryData(queryKey, updater)
    } else {
      queryClient.setQueryData(queryKey, data)
    }
  }, [queryClient])

  // Obter dados do cache
  const getCacheData = useCallback((queryKey: string[]) => {
    return queryClient.getQueryData(queryKey)
  }, [queryClient])

  return {
    invalidateProdutos,
    invalidatePedidos,
    invalidateEmpresas,
    invalidateRelated,
    clearCache,
    prefetchData,
    setCacheData,
    getCacheData,
  }
}