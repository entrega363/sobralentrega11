'use client'

import { useState, useEffect } from 'react'
import { useAuthSelectors } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { user } = useAuthSelectors()
  const supabase = createClient()

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      setIsSubscribed(!!sub)
    } catch (error) {
      console.error('Erro ao verificar inscrição:', error)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notificações não suportadas',
        description: 'Seu navegador não suporta notificações push',
        variant: 'destructive'
      })
      return false
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      toast({
        title: 'Notificações ativadas',
        description: 'Você receberá notificações sobre seus pedidos'
      })
      return true
    } else {
      toast({
        title: 'Permissão negada',
        description: 'Você não receberá notificações push',
        variant: 'destructive'
      })
      return false
    }
  }

  const subscribe = async () => {
    if (!isSupported || !user) return false

    try {
      const hasPermission = await requestPermission()
      if (!hasPermission) return false

      const registration = await navigator.serviceWorker.ready
      
      // Chave pública VAPID (você deve gerar uma para produção)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI'

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // Salvar subscription no Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: JSON.stringify(sub),
          user_type: user.user_metadata?.role || 'consumidor',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setSubscription(sub)
      setIsSubscribed(true)

      toast({
        title: 'Notificações ativadas',
        description: 'Você receberá notificações sobre atualizações importantes'
      })

      return true
    } catch (error) {
      console.error('Erro ao inscrever para notificações:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar as notificações',
        variant: 'destructive'
      })
      return false
    }
  }

  const unsubscribe = async () => {
    if (!subscription || !user) return false

    try {
      await subscription.unsubscribe()
      
      // Remover subscription do Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setSubscription(null)
      setIsSubscribed(false)

      toast({
        title: 'Notificações desativadas',
        description: 'Você não receberá mais notificações push'
      })

      return true
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar as notificações',
        variant: 'destructive'
      })
      return false
    }
  }

  const sendTestNotification = async () => {
    if (!isSubscribed || !user) return

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          notification: {
            title: 'Notificação de Teste',
            body: 'Esta é uma notificação de teste do sistema!',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'test-notification'
          }
        })
      })

      if (!response.ok) throw new Error('Falha ao enviar notificação')

      toast({
        title: 'Notificação enviada',
        description: 'Verifique se recebeu a notificação de teste'
      })
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a notificação de teste',
        variant: 'destructive'
      })
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission
  }
}

// Função utilitária para converter chave VAPID
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}