'use client'

import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react'

export function ConnectionStatus() {
  const { status, isConnected, hasError, activeChannels, lastUpdate } = useRealtimeSync()

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-3 w-3" />
      case 'connecting':
        return <Clock className="h-3 w-3 animate-spin" />
      case 'error':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <WifiOff className="h-3 w-3" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return `Conectado (${activeChannels} canais)`
      case 'connecting':
        return 'Conectando...'
      case 'error':
        return 'Erro de conexão'
      default:
        return 'Desconectado'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant="outline" 
        className={`flex items-center space-x-1 text-xs ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>
      
      {lastUpdate && isConnected && (
        <span className="text-xs text-gray-500">
          Última atualização: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}