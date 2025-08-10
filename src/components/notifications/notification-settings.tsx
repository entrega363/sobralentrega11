'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { Bell, BellOff, TestTube, Smartphone } from 'lucide-react'

export function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications()

  const [isLoading, setIsLoading] = useState(false)

  const handleToggleNotifications = async () => {
    setIsLoading(true)
    try {
      if (isSubscribed) {
        await unsubscribe()
      } else {
        await subscribe()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    setIsLoading(true)
    try {
      await sendTestNotification()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Para receber notificações, use um navegador compatível como Chrome, Firefox ou Safari
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
          {isSubscribed && (
            <Badge variant="secondary" className="ml-2">
              Ativo
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Receba notificações em tempo real sobre seus pedidos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Ativar Notificações Push
            </p>
            <p className="text-sm text-gray-600">
              Receba alertas sobre atualizações de pedidos
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggleNotifications}
            disabled={isLoading}
          />
        </div>

        {isSubscribed && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <p className="text-sm font-medium">Tipos de Notificação</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Novos pedidos recebidos
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Status de pedidos atualizados
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Pedidos prontos para entrega
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Entregas concluídas
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={isLoading}
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Enviar Notificação de Teste
            </Button>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Como funcionam as notificações?
              </p>
              <p className="text-sm text-blue-700">
                Você receberá notificações automáticas quando houver atualizações importantes 
                em seus pedidos, mesmo quando não estiver usando o aplicativo.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}