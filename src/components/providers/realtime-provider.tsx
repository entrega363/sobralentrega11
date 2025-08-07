'use client'

import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'
import { useOfflineCache } from '@/hooks/use-offline-cache'
import { useAuthSelectors } from '@/stores/auth-store'
import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthSelectors()
  const { isOnline, pendingActions } = useOfflineCache()
  const [showConnectionToast, setShowConnectionToast] = useState(false)

  // Ativar sincronização em tempo real apenas se autenticado
  const realtimeState = useRealtimeSync()
  
  // Ativar sistema de notificações
  const { unreadCount } = useRealtimeNotifications()

  // Notificar sobre status de conexão
  useEffect(() => {
    if (!isAuthenticated) return

    const handleOnline = () => {
      setShowConnectionToast(true)
      toast({
        title: '🟢 Conectado',
        description: 'Conexão restaurada. Sincronizando dados...',
      })
      
      // Esconder toast após 3 segundos
      setTimeout(() => setShowConnectionToast(false), 3000)
    }

    const handleOffline = () => {
      setShowConnectionToast(true)
      toast({
        title: '🔴 Desconectado',
        description: 'Você está offline. As alterações serão sincronizadas quando a conexão for restaurada.',
        variant: 'destructive',
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated])

  // Mostrar indicador de ações pendentes
  useEffect(() => {
    if (pendingActions > 0 && isOnline) {
      toast({
        title: '⏳ Sincronizando',
        description: `${pendingActions} ação(ões) pendente(s) sendo processada(s)...`,
      })
    }
  }, [pendingActions, isOnline])

  // Notificar sobre erros de conexão real-time
  useEffect(() => {
    if (realtimeState.hasError && isAuthenticated) {
      toast({
        title: '⚠️ Erro de Conexão',
        description: 'Problemas na sincronização em tempo real. Tentando reconectar...',
        variant: 'destructive',
      })
    }
  }, [realtimeState.hasError, isAuthenticated])

  return (
    <>
      {children}
      
      {/* Indicadores de status */}
      {isAuthenticated && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {/* Status de conexão offline */}
          {!isOnline && (
            <div className="bg-red-500 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Offline</span>
            </div>
          )}
          
          {/* Status de real-time */}
          {isOnline && !realtimeState.isConnected && (
            <div className="bg-orange-500 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Conectando...</span>
            </div>
          )}
          
          {/* Ações pendentes */}
          {pendingActions > 0 && (
            <div className="bg-yellow-500 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>
              <span>{pendingActions} pendente(s)</span>
            </div>
          )}
          
          {/* Status de real-time conectado */}
          {realtimeState.isConnected && realtimeState.activeChannels > 0 && (
            <div className="bg-green-500 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Real-time ativo</span>
              {realtimeState.lastUpdate && (
                <span className="text-xs opacity-75">
                  {realtimeState.lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
          
          {/* Contador de notificações não lidas */}
          {unreadCount > 0 && (
            <div className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-2 shadow-lg">
              <span>🔔</span>
              <span>{unreadCount} nova(s)</span>
            </div>
          )}
        </div>
      )}
    </>
  )
}