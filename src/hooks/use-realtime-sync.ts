'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthSelectors } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'
import { useCacheInvalidation } from './use-cache-invalidation'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface RealtimeState {
  status: ConnectionStatus
  lastUpdate: Date | null
  activeChannels: number
  reconnectAttempts: number
}

export function useRealtimeSync() {
  const queryClient = useQueryClient()
  const { user, userRole } = useAuthSelectors()
  const { invalidateRelated } = useCacheInvalidation()
  const supabase = createClient()
  
  const [state, setState] = useState<RealtimeState>({
    status: 'disconnected',
    lastUpdate: null,
    activeChannels: 0,
    reconnectAttempts: 0
  })
  
  const channelsRef = useRef<any[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const maxReconnectAttempts = 5

  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    setState(prev => ({ ...prev, status }))
  }, [])

  const handleReconnect = useCallback(() => {
    if (state.reconnectAttempts >= maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      updateConnectionStatus('error')
      return
    }

    setState(prev => ({ 
      ...prev, 
      reconnectAttempts: prev.reconnectAttempts + 1 
    }))

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Reconnect attempt ${state.reconnectAttempts + 1}`)
      // A reconexão será feita automaticamente pelo useEffect
    }, Math.pow(2, state.reconnectAttempts) * 1000) // Backoff exponencial
  }, [state.reconnectAttempts, maxReconnectAttempts, updateConnectionStatus])

  const setupChannels = useCallback(() => {
    if (!user) return

    updateConnectionStatus('connecting')
    const channels: any[] = []

    // Sincronização de produtos (para empresas)
    if (userRole === 'empresa') {
      const produtosChannel = supabase
        .channel('produtos-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'produtos',
            filter: `empresa_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Produto changed:', payload)
            
            setState(prev => ({ ...prev, lastUpdate: new Date() }))
            invalidateRelated('produto', payload.eventType.toLowerCase() as any, payload.new || payload.old)
            
            if (payload.eventType === 'INSERT') {
              toast({
                title: '✅ Produto adicionado',
                description: `Produto "${payload.new?.nome}" foi adicionado com sucesso.`,
              })
            } else if (payload.eventType === 'UPDATE') {
              toast({
                title: '📝 Produto atualizado',
                description: `Produto "${payload.new?.nome}" foi atualizado.`,
              })
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            updateConnectionStatus('connected')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Produtos channel error')
            updateConnectionStatus('error')
            handleReconnect()
          }
        })

      channels.push(produtosChannel)
    }

    // Sincronização de pedidos (para todos os usuários)
    const pedidosChannel = supabase
      .channel('pedidos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
        },
        (payload) => {
          console.log('Pedido changed:', payload)
          
          setState(prev => ({ ...prev, lastUpdate: new Date() }))
          invalidateRelated('pedido', payload.eventType.toLowerCase() as any, payload.new || payload.old)
          
          // Notificações específicas por role
          if (payload.eventType === 'INSERT') {
            if (userRole === 'empresa') {
              // Verificar se o pedido contém produtos da empresa
              toast({
                title: '🔔 Novo pedido!',
                description: 'Você recebeu um novo pedido para processar.',
              })
            } else if (userRole === 'consumidor' && payload.new?.consumidor_id === user.id) {
              toast({
                title: '✅ Pedido confirmado',
                description: 'Seu pedido foi confirmado e está sendo processado.',
              })
            }
          }
          
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new?.status
            const oldStatus = payload.old?.status
            
            if (newStatus !== oldStatus) {
              const statusMessages: Record<string, string> = {
                'confirmado': '✅ Pedido confirmado',
                'preparando': '👨‍🍳 Preparando seu pedido',
                'pronto': '🍽️ Pedido pronto para entrega',
                'saiu_entrega': '🚚 Pedido saiu para entrega',
                'entregue': '🎉 Pedido entregue',
                'cancelado': '❌ Pedido cancelado'
              }
              
              if (userRole === 'consumidor' && payload.new?.consumidor_id === user.id) {
                toast({
                  title: statusMessages[newStatus] || 'Status atualizado',
                  description: `Seu pedido #${payload.new?.id} foi atualizado.`,
                })
              }
              
              if (userRole === 'entregador' && newStatus === 'pronto') {
                toast({
                  title: '🚚 Nova entrega disponível!',
                  description: 'Um pedido está pronto para entrega.',
                })
              }
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          updateConnectionStatus('connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Pedidos channel error')
          updateConnectionStatus('error')
          handleReconnect()
        }
      })

    channels.push(pedidosChannel)

    // Sincronização de empresas (para admin)
    if (userRole === 'admin') {
      const empresasChannel = supabase
        .channel('empresas-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'empresas',
          },
          (payload) => {
            console.log('Empresa changed:', payload)
            
            setState(prev => ({ ...prev, lastUpdate: new Date() }))
            invalidateRelated('empresa', payload.eventType.toLowerCase() as any, payload.new || payload.old)
            
            if (payload.eventType === 'INSERT') {
              toast({
                title: '🏢 Nova empresa',
                description: `${payload.new?.nome} se cadastrou e aguarda aprovação.`,
              })
            } else if (payload.eventType === 'UPDATE' && payload.new?.status !== payload.old?.status) {
              const status = payload.new?.status === 'ativa' ? 'aprovada' : 'rejeitada'
              toast({
                title: `🏢 Empresa ${status}`,
                description: `${payload.new?.nome} foi ${status}.`,
              })
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            updateConnectionStatus('connected')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Empresas channel error')
            updateConnectionStatus('error')
            handleReconnect()
          }
        })

      channels.push(empresasChannel)
    }

    channelsRef.current = channels
    setState(prev => ({ ...prev, activeChannels: channels.length }))

    return channels
  }, [user, userRole, supabase, invalidateRelated, updateConnectionStatus, handleReconnect])

  useEffect(() => {
    if (!user) {
      setState({
        status: 'disconnected',
        lastUpdate: null,
        activeChannels: 0,
        reconnectAttempts: 0
      })
      return
    }

    const channels = setupChannels()

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      channels?.forEach(channel => {
        supabase.removeChannel(channel)
      })
      
      channelsRef.current = []
      setState(prev => ({ ...prev, activeChannels: 0 }))
    }
  }, [user, userRole, setupChannels, supabase])

  return {
    ...state,
    isConnected: state.status === 'connected',
    hasError: state.status === 'error',
  }
}

// Hook específico para sincronização de pedidos em tempo real
export function useRealtimePedidos(empresaId?: string) {
  const { invalidateRelated } = useCacheInvalidation()
  const supabase = createClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!empresaId) return

    const channel = supabase
      .channel(`pedidos-empresa-${empresaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedido_itens',
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload) => {
          console.log('Pedido item changed for empresa:', payload)
          
          invalidateRelated('pedido', payload.eventType.toLowerCase() as any, payload.new || payload.old)
          
          // Buscar dados do pedido para notificação
          if (payload.eventType === 'INSERT') {
            toast({
              title: '🔔 Novo pedido!',
              description: 'Você recebeu um novo pedido. Verifique a aba de pedidos.',
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Pedidos empresa channel error')
          setIsConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [empresaId, supabase, invalidateRelated])

  return { isConnected }
}

// Hook para sincronização de entregas (para entregadores)
export function useRealtimeEntregas(entregadorId?: string) {
  const { invalidateRelated } = useCacheInvalidation()
  const supabase = createClient()
  const [isConnected, setIsConnected] = useState(false)
  const [availableDeliveries, setAvailableDeliveries] = useState(0)

  useEffect(() => {
    if (!entregadorId) return

    const channel = supabase
      .channel(`entregas-${entregadorId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `status=eq.pronto`,
        },
        (payload) => {
          console.log('Nova entrega disponível:', payload)
          
          invalidateRelated('pedido', 'update', payload.new)
          setAvailableDeliveries(prev => prev + 1)
          
          toast({
            title: '🚚 Nova entrega disponível!',
            description: 'Um pedido está pronto para entrega.',
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `entregador_id=eq.${entregadorId}`,
        },
        (payload) => {
          console.log('Entrega atualizada:', payload)
          
          invalidateRelated('pedido', 'update', payload.new)
          
          const newStatus = payload.new?.status
          const oldStatus = payload.old?.status
          
          if (newStatus !== oldStatus) {
            if (newStatus === 'saiu_entrega') {
              toast({
                title: '🚚 Entrega iniciada',
                description: `Você iniciou a entrega do pedido #${payload.new?.id}`,
              })
            } else if (newStatus === 'entregue') {
              toast({
                title: '✅ Entrega concluída',
                description: `Pedido #${payload.new?.id} foi entregue com sucesso!`,
              })
              setAvailableDeliveries(prev => Math.max(0, prev - 1))
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Entregas channel error')
          setIsConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [entregadorId, supabase, invalidateRelated])

  return { 
    isConnected, 
    availableDeliveries,
    resetAvailableCount: () => setAvailableDeliveries(0)
  }
}