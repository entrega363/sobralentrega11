'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDeliveryTracking } from '@/hooks/use-delivery-tracking'
import { MapPin, Navigation, Clock, Truck, Play, Square } from 'lucide-react'

interface DeliveryMapProps {
  pedidoId?: string
  showControls?: boolean
}

export function DeliveryMap({ pedidoId, showControls = true }: DeliveryMapProps) {
  const {
    isTracking,
    position,
    deliveryLocations,
    routeInfo,
    isSupported,
    startTracking,
    stopTracking,
    getRouteToDestination
  } = useDeliveryTracking()

  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupported) {
      setMapError('Geolocalização não é suportada neste dispositivo')
    }
  }, [isSupported])

  const currentDelivery = pedidoId 
    ? deliveryLocations.find(loc => loc.pedidoId === pedidoId)
    : deliveryLocations[0]

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  if (mapError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{mapError}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Rastreamento de Entrega
          {isTracking && (
            <Badge variant="secondary" className="ml-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
              Ativo
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isTracking 
            ? 'Sua localização está sendo compartilhada em tempo real'
            : 'Ative o rastreamento para compartilhar sua localização'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controles de Rastreamento */}
        {showControls && (
          <div className="flex gap-2">
            {!isTracking ? (
              <Button onClick={startTracking} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Rastreamento
              </Button>
            ) : (
              <Button onClick={stopTracking} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Parar Rastreamento
              </Button>
            )}
          </div>
        )}

        {/* Informações de Localização */}
        {position && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Localização Atual</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Latitude: {position.latitude.toFixed(6)}</p>
              <p>Longitude: {position.longitude.toFixed(6)}</p>
              <p>Precisão: {Math.round(position.accuracy)}m</p>
              <p>Atualizado: {new Date(position.timestamp).toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
        )}

        {/* Informações da Rota */}
        {routeInfo && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Informações da Rota</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-700">Distância</p>
                <p className="font-semibold text-green-900">
                  {formatDistance(routeInfo.distance)}
                </p>
              </div>
              <div>
                <p className="text-green-700">Tempo Estimado</p>
                <p className="font-semibold text-green-900 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(routeInfo.duration)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Entregas Ativas */}
        {deliveryLocations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Entregas em Andamento</h4>
            {deliveryLocations.map((delivery) => (
              <div key={delivery.pedidoId} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pedido #{delivery.pedidoId.slice(-4)}</p>
                    <p className="text-sm text-gray-600">
                      Última atualização: {new Date(delivery.timestamp).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {Math.round(delivery.accuracy)}m
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mapa Placeholder */}
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Mapa Interativo</p>
            <p className="text-sm text-gray-500">
              {position 
                ? `Mostrando localização: ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`
                : 'Aguardando localização...'
              }
            </p>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900 mb-1">Como funciona:</p>
              <ul className="text-yellow-700 space-y-1">
                <li>• Ative o rastreamento para compartilhar sua localização</li>
                <li>• Clientes podem acompanhar a entrega em tempo real</li>
                <li>• Você será notificado quando estiver próximo ao destino</li>
                <li>• Confirme a entrega automaticamente ao chegar</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}