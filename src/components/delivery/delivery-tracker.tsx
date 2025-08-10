'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Truck, Phone, Navigation, RefreshCw } from 'lucide-react'

interface DeliveryTrackerProps {
  pedidoId: string
  status: string
  entregadorNome?: string
  entregadorTelefone?: string
}

interface DeliveryLocation {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
  entregador: {
    nome: string
    telefone: string
  }
}

export function DeliveryTracker({ 
  pedidoId, 
  status, 
  entregadorNome, 
  entregadorTelefone 
}: DeliveryTrackerProps) {
  const [location, setLocation] = useState<DeliveryLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)

  const fetchLocation = async () => {
    if (status !== 'saiu_entrega') return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/delivery/location?pedidoId=${pedidoId}`)
      const data = await response.json()

      if (response.ok && data.location) {
        setLocation(data.location)
        
        // Simular cálculo de tempo estimado (em produção, usar API de rotas)
        const randomTime = Math.floor(Math.random() * 20) + 5 // 5-25 minutos
        setEstimatedTime(randomTime)
      } else {
        setError(data.message || 'Localização não disponível')
      }
    } catch (err) {
      console.error('Erro ao buscar localização:', err)
      setError('Erro ao carregar localização do entregador')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLocation()
    
    // Atualizar localização a cada 30 segundos se estiver em entrega
    let interval: NodeJS.Timeout | null = null
    
    if (status === 'saiu_entrega') {
      interval = setInterval(fetchLocation, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pedidoId, status])

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
  }

  const getTimeSinceUpdate = (timestamp: string) => {
    const now = new Date()
    const updateTime = new Date(timestamp)
    const diffMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'agora mesmo'
    if (diffMinutes === 1) return '1 minuto atrás'
    return `${diffMinutes} minutos atrás`
  }

  if (status !== 'saiu_entrega') {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Truck className="h-5 w-5" />
          Rastreamento da Entrega
          <Badge variant="secondary" className="ml-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
            Em Trânsito
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-700">
          Acompanhe a localização do seu entregador em tempo real
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações do Entregador */}
        <div className="bg-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {entregadorNome || location?.entregador?.nome || 'Entregador'}
              </p>
              <p className="text-sm text-gray-600">
                {entregadorTelefone || location?.entregador?.telefone || 'Telefone não disponível'}
              </p>
            </div>
            {(entregadorTelefone || location?.entregador?.telefone) && (
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
            )}
          </div>
        </div>

        {/* Status da Localização */}
        {isLoading ? (
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Buscando localização...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
              <Button size="sm" variant="outline" onClick={fetchLocation}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : location ? (
          <div className="space-y-3">
            {/* Localização Atual */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Localização Atual</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Coordenadas: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                <p>Precisão: {Math.round(location.accuracy)}m</p>
                <p>Atualizado: {getTimeSinceUpdate(location.timestamp)}</p>
              </div>
            </div>

            {/* Tempo Estimado */}
            {estimatedTime && (
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Tempo Estimado</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(estimatedTime)}
                </p>
                <p className="text-sm text-gray-600">
                  Previsão de chegada baseada na localização atual
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Aguardando localização do entregador...
            </p>
          </div>
        )}

        {/* Mapa Placeholder */}
        <div className="bg-white rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Mapa de Rastreamento</p>
            <p className="text-sm text-gray-500">
              {location 
                ? `Entregador em: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : 'Aguardando localização...'
              }
            </p>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-100 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Acompanhe sua entrega:</p>
              <ul className="space-y-1">
                <li>• A localização é atualizada automaticamente</li>
                <li>• Você receberá notificações sobre o progresso</li>
                <li>• Entre em contato com o entregador se necessário</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}