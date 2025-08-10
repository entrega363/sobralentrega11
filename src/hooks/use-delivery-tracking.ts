'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGeolocation } from './use-geolocation'
import { usePedidosStore } from '@/stores/pedidos-store'
import { useAuthSelectors } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'

interface DeliveryLocation {
  pedidoId: string
  entregadorId: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  estimatedArrival?: number
}

interface RouteInfo {
  distance: number // em metros
  duration: number // em segundos
  polyline?: string
}

export function useDeliveryTracking() {
  const [isTracking, setIsTracking] = useState(false)
  const [deliveryLocations, setDeliveryLocations] = useState<Map<string, DeliveryLocation>>(new Map())
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const { user } = useAuthSelectors()
  const { getPedidosByEntregador, updatePedidoStatus } = usePedidosStore()

  const { 
    position, 
    isSupported, 
    startWatching, 
    stopWatching, 
    requestPermission 
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 30000,
    watchPosition: isTracking,
    onLocationUpdate: handleLocationUpdate
  })

  function handleLocationUpdate(newPosition: any) {
    if (!user || !isTracking) return

    // Atualizar localização para pedidos em entrega
    const pedidosEmEntrega = getPedidosByEntregador(user.id).filter(
      p => p.status === 'saiu_entrega'
    )

    pedidosEmEntrega.forEach(pedido => {
      const deliveryLocation: DeliveryLocation = {
        pedidoId: pedido.id,
        entregadorId: user.id,
        latitude: newPosition.latitude,
        longitude: newPosition.longitude,
        accuracy: newPosition.accuracy,
        timestamp: newPosition.timestamp
      }

      // Calcular distância até o destino
      const distance = calculateDistance(
        newPosition.latitude,
        newPosition.longitude,
        getDestinationCoords(pedido.endereco)
      )

      // Se estiver próximo (menos de 100m), marcar como entregue
      if (distance < 0.1) {
        handleNearDestination(pedido.id)
      }

      setDeliveryLocations(prev => new Map(prev.set(pedido.id, deliveryLocation)))
      
      // Enviar localização para o servidor (para outros usuários acompanharem)
      sendLocationUpdate(deliveryLocation)
    })
  }

  const startTracking = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: 'Geolocalização não suportada',
        description: 'Seu dispositivo não suporta rastreamento de localização',
        variant: 'destructive'
      })
      return false
    }

    const hasPermission = await requestPermission()
    if (!hasPermission) {
      toast({
        title: 'Permissão necessária',
        description: 'Ative a localização para rastrear entregas',
        variant: 'destructive'
      })
      return false
    }

    setIsTracking(true)
    startWatching()
    
    toast({
      title: 'Rastreamento ativado',
      description: 'Sua localização está sendo compartilhada para entregas ativas'
    })

    return true
  }, [isSupported, requestPermission, startWatching])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
    stopWatching()
    setDeliveryLocations(new Map())
    
    toast({
      title: 'Rastreamento desativado',
      description: 'Sua localização não está mais sendo compartilhada'
    })
  }, [stopWatching])

  const handleNearDestination = useCallback(async (pedidoId: string) => {
    try {
      // Confirmar entrega
      const shouldConfirm = window.confirm(
        'Você está próximo ao destino. Confirmar entrega?'
      )
      
      if (shouldConfirm) {
        updatePedidoStatus(pedidoId, 'entregue')
        
        toast({
          title: 'Entrega confirmada!',
          description: 'Pedido marcado como entregue com sucesso'
        })

        // Remover da lista de rastreamento
        setDeliveryLocations(prev => {
          const newMap = new Map(prev)
          newMap.delete(pedidoId)
          return newMap
        })
      }
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar a entrega',
        variant: 'destructive'
      })
    }
  }, [updatePedidoStatus])

  const sendLocationUpdate = useCallback(async (location: DeliveryLocation) => {
    try {
      await fetch('/api/delivery/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(location)
      })
    } catch (error) {
      console.error('Erro ao enviar localização:', error)
    }
  }, [])

  const getRouteToDestination = useCallback(async (destinationAddress: string) => {
    if (!position) return null

    try {
      // Aqui você integraria com uma API de rotas como Google Maps, Mapbox, etc.
      // Por enquanto, vamos simular
      const mockRoute: RouteInfo = {
        distance: Math.random() * 5000 + 1000, // 1-6km
        duration: Math.random() * 1800 + 600,  // 10-40 minutos
      }

      setRouteInfo(mockRoute)
      return mockRoute
    } catch (error) {
      console.error('Erro ao calcular rota:', error)
      return null
    }
  }, [position])

  // Auto-start tracking para entregadores com pedidos ativos
  useEffect(() => {
    if (user?.user_metadata?.role === 'entregador') {
      const pedidosAtivos = getPedidosByEntregador(user.id).filter(
        p => p.status === 'saiu_entrega'
      )
      
      if (pedidosAtivos.length > 0 && !isTracking) {
        startTracking()
      } else if (pedidosAtivos.length === 0 && isTracking) {
        stopTracking()
      }
    }
  }, [user, getPedidosByEntregador, isTracking, startTracking, stopTracking])

  return {
    isTracking,
    position,
    deliveryLocations: Array.from(deliveryLocations.values()),
    routeInfo,
    isSupported,
    startTracking,
    stopTracking,
    getRouteToDestination
  }
}

// Função utilitária para calcular distância entre dois pontos (Haversine)
function calculateDistance(lat1: number, lon1: number, coords: { lat: number, lng: number }): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (coords.lat - lat1) * Math.PI / 180
  const dLon = (coords.lng - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Função para extrair coordenadas do endereço (simulada)
function getDestinationCoords(address: string): { lat: number, lng: number } {
  // Em produção, você usaria uma API de geocoding
  // Por enquanto, retornamos coordenadas de Sobral-CE
  return {
    lat: -3.6880 + (Math.random() - 0.5) * 0.1,
    lng: -40.3492 + (Math.random() - 0.5) * 0.1
  }
}