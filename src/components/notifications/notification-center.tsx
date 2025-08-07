'use client'

import { useState } from 'react'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Bell, Settings, Trash2, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateSettings,
  } = useRealtimeNotifications()
  
  const [isOpen, setIsOpen] = useState(false)

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Tabs defaultValue="notifications" className="w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="m-0">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notificações</h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearNotifications}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Configurações de Notificação</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pedidos" className="text-sm">
                    Notificações de Pedidos
                  </Label>
                  <Switch
                    id="pedidos"
                    checked={settings.pedidos}
                    onCheckedChange={(checked) => 
                      updateSettings({ pedidos: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="produtos" className="text-sm">
                    Notificações de Produtos
                  </Label>
                  <Switch
                    id="produtos"
                    checked={settings.produtos}
                    onCheckedChange={(checked) => 
                      updateSettings({ produtos: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="empresas" className="text-sm">
                    Notificações de Empresas
                  </Label>
                  <Switch
                    id="empresas"
                    checked={settings.empresas}
                    onCheckedChange={(checked) => 
                      updateSettings({ empresas: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="entregas" className="text-sm">
                    Notificações de Entregas
                  </Label>
                  <Switch
                    id="entregas"
                    checked={settings.entregas}
                    onCheckedChange={(checked) => 
                      updateSettings({ entregas: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="sound" className="text-sm">
                    Som das Notificações
                  </Label>
                  <Switch
                    id="sound"
                    checked={settings.sound}
                    onCheckedChange={(checked) => 
                      updateSettings({ sound: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}