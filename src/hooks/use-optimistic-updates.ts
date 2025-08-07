'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export function useOptimisticUpdates() {
  const queryClient = useQueryClient()

  // Atualização otimista para produtos
  const updateProdutoOptimistic = useCallback((
    produtoId: string,
    updates: Partial<any>,
    rollback?: () => void
  ) => {
    // Salvar estado anterior
    const previousData = queryClient.getQueryData(['produto', produtoId])
    
    // Aplicar atualização otimista
    queryClient.setQueryData(['produto', produtoId], (old: any) => ({
      ...old,
      ...updates,
    }))

    // Atualizar também na lista de produtos
    queryClient.setQueriesData(
      { queryKey: ['produtos'] },
      (old: any) => {
        if (!old?.produtos) return old
        
        return {
          ...old,
          produtos: old.produtos.map((produto: any) =>
            produto.id === produtoId ? { ...produto, ...updates } : produto
          ),
        }
      }
    )

    // Retornar função de rollback
    return () => {
      if (previousData) {
        queryClient.setQueryData(['produto', produtoId], previousData)
      }
      rollback?.()
    }
  }, [queryClient])

  // Atualização otimista para pedidos
  const updatePedidoOptimistic = useCallback((
    pedidoId: string,
    updates: Partial<any>,
    rollback?: () => void
  ) => {
    // Salvar estado anterior
    const previousData = queryClient.getQueryData(['pedidos'])
    
    // Aplicar atualização otimista
    queryClient.setQueriesData(
      { queryKey: ['pedidos'] },
      (old: any) => {
        if (!old?.pedidos) return old
        
        return {
          ...old,
          pedidos: old.pedidos.map((pedido: any) =>
            pedido.id === pedidoId ? { ...pedido, ...updates } : pedido
          ),
        }
      }
    )

    // Retornar função de rollback
    return () => {
      if (previousData) {
        queryClient.setQueryData(['pedidos'], previousData)
      }
      rollback?.()
    }
  }, [queryClient])

  // Adicionar item otimisticamente
  const addItemOptimistic = useCallback((
    queryKey: string[],
    newItem: any,
    rollback?: () => void
  ) => {
    // Salvar estado anterior
    const previousData = queryClient.getQueryData(queryKey)
    
    // Adicionar item otimisticamente
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return { [queryKey[0]]: [newItem], total: 1 }
      
      const items = old[queryKey[0]] || []
      return {
        ...old,
        [queryKey[0]]: [newItem, ...items],
        total: (old.total || 0) + 1,
      }
    })

    // Retornar função de rollback
    return () => {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData)
      }
      rollback?.()
    }
  }, [queryClient])

  // Remover item otimisticamente
  const removeItemOptimistic = useCallback((
    queryKey: string[],
    itemId: string,
    rollback?: () => void
  ) => {
    // Salvar estado anterior
    const previousData = queryClient.getQueryData(queryKey)
    
    // Remover item otimisticamente
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old
      
      const items = old[queryKey[0]] || []
      const filteredItems = items.filter((item: any) => item.id !== itemId)
      
      return {
        ...old,
        [queryKey[0]]: filteredItems,
        total: Math.max((old.total || 0) - 1, 0),
      }
    })

    // Retornar função de rollback
    return () => {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData)
      }
      rollback?.()
    }
  }, [queryClient])

  return {
    updateProdutoOptimistic,
    updatePedidoOptimistic,
    addItemOptimistic,
    removeItemOptimistic,
  }
}