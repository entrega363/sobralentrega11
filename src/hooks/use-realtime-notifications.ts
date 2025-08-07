'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthSelectors } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  data?: any
}

interface NotificationSettings {
  pedidos: boolean
  produtos: boolean
  empresas: boolean
  entregas: boolean
  sound: boolean
}

export function useRealtimeNotifications() {
  const { user, userRole } = useAuthSelectors()
  const supabase = createClient()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [settings, setSettings] = useState<NotificationSettings>({
    pedidos: true,
    produtos: true,
    empresas: true,
    entregas: true,
    sound: true,
  })

  // Adicionar nova notificação
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]) // Manter apenas 50 notificações
    setUnreadCount(prev => prev + 1)

    // Tocar som se habilitado
    if (settings.sound) {
      playNotificationSound()
    }

    // Mostrar toast
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default',
    })

    return newNotification.id
  }, [settings.sound])

  // Marcar notificação como lida
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  // Limpar notificações
  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Tocar som de notificação
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.3
      audio.play().catch(console.error)
    } catch (error) {
      console.error('Erro ao tocar som de notificação:', error)
    }
  }, [])

  // Configurar notificações baseadas no role do usuário
  useEffect(() => {
    if (!user || !userRole) return

    const channels: any[] = []

    // Notificações para empresas
    if (userRole === 'empresa' && settings.pedidos) {
      const pedidosChannel = supabase
        .channel(`notifications-pedidos-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pedido_itens',
            filter: `empresa_id=eq.${user.id}`,
          },
          (payload) => {
            addNotification({
              title: '🔔 Novo Pedido',
              message: 'Você recebeu um novo pedido para processar.',
              type: 'info',
              data: payload.new,
            })
          }
        )
        .subscribe()

      channels.push(pedidosChannel)
    }

    // Notificações para consumidores
    if (userRole === 'consumidor' && settings.pedidos) {
      const statusChannel = supabase
        .channel(`notifications-status-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'pedidos',
            filter: `consumidor_id=eq.${user.id}`,
          },
          (payload) => {
            const newStatus = payload.new?.status
            const oldStatus = payload.old?.status

            if (newStatus !== oldStatus) {
              const statusMessages: Record<string, { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }> = {
                'confirmado': {
                  title: '✅ Pedido Confirmado',
                  message: 'Seu pedido foi confirmado e está sendo processado.',
                  type: 'success'
                },
                'preparando': {
                  title: '👨‍🍳 Preparando',
                  message: 'Seu pedido está sendo preparado.',
                  type: 'info'
                },
                'pronto': {
                  title: '🍽️ Pedido Pronto',
                  message: 'Seu pedido está pronto e aguardando entrega.',
                  type: 'success'
                },
                'saiu_entrega': {
                  title: '🚚 Saiu para Entrega',
                  message: 'Seu pedido saiu para entrega.',
                  type: 'info'
                },
                'entregue': {
                  title: '🎉 Pedido Entregue',
                  message: 'Seu pedido foi entregue com sucesso!',
                  type: 'success'
                },
                'cancelado': {
                  title: '❌ Pedido Cancelado',
                  message: 'Seu pedido foi cancelado.',
                  type: 'error'
                }
              }

              const statusInfo = statusMessages[newStatus]
              if (statusInfo) {
                addNotification({
                  title: statusInfo.title,
                  message: `${statusInfo.message} (Pedido #${payload.new?.id})`,
                  type: statusInfo.type,
                  data: payload.new,
                })
              }
            }
          }
        )
        .subscribe()

      channels.push(statusChannel)
    }

    // Notificações para entregadores
    if (userRole === 'entregador' && settings.entregas) {
      const entregasChannel = supabase
        .channel(`notifications-entregas-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'pedidos',
            filter: `status=eq.pronto`,
          },
          (payload) => {
            addNotification({
              title: '🚚 Nova Entrega',
              message: 'Um pedido está pronto para entrega.',
              type: 'info',
              data: payload.new,
            })
          }
        )
        .subscribe()

      channels.push(entregasChannel)
    }

    // Notificações para admin
    if (userRole === 'admin') {
      if (settings.empresas) {
        const empresasChannel = supabase
          .channel(`notifications-empresas-admin`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'empresas',
            },
            (payload) => {
              addNotification({
                title: '🏢 Nova Empresa',
                message: `${payload.new?.nome} se cadastrou e aguarda aprovação.`,
                type: 'info',
                data: payload.new,
              })
            }
          )
          .subscribe()

        channels.push(empresasChannel)
      }

      if (settings.produtos) {
        const produtosChannel = supabase
          .channel(`notifications-produtos-admin`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'produtos',
            },
            (payload) => {
              addNotification({
                title: '📦 Novo Produto',
                message: `Produto "${payload.new?.nome}" foi cadastrado.`,
                type: 'info',
                data: payload.new,
              })
            }
          )
          .subscribe()

        channels.push(produtosChannel)
      }
    }

    // Cleanup
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [user, userRole, settings, supabase, addNotification])

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Erro ao carregar configurações de notificação:', error)
      }
    }
  }, [])

  // Salvar configurações no localStorage
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('notification-settings', JSON.stringify(updatedSettings))
  }, [settings])

  return {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateSettings,
  }
}