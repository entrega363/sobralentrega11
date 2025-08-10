'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'

interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface GeolocationError {
  code: number
  message: string
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watchPosition?: boolean
  onLocationUpdate?: (position: GeolocationPosition) => void
  onError?: (error: GeolocationError) => void
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watchPosition = false,
    onLocationUpdate,
    onError
  } = options

  useEffect(() => {
    setIsSupported('geolocation' in navigator)
  }, [])

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const newPosition: GeolocationPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp
    }
    
    setPosition(newPosition)
    setError(null)
    setIsLoading(false)
    
    if (onLocationUpdate) {
      onLocationUpdate(newPosition)
    }
  }, [onLocationUpdate])

  const handleError = useCallback((err: GeolocationPositionError) => {
    const errorObj: GeolocationError = {
      code: err.code,
      message: getErrorMessage(err.code)
    }
    
    setError(errorObj)
    setIsLoading(false)
    
    if (onError) {
      onError(errorObj)
    } else {
      toast({
        title: 'Erro de Localização',
        description: errorObj.message,
        variant: 'destructive'
      })
    }
  }, [onError])

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      const error: GeolocationError = {
        code: -1,
        message: 'Geolocalização não é suportada neste navegador'
      }
      setError(error)
      if (onError) onError(error)
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    )
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError])

  const startWatching = useCallback(() => {
    if (!isSupported || watchId !== null) return

    setIsLoading(true)
    setError(null)

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    )

    setWatchId(id)
  }, [isSupported, watchId, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError])

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setIsLoading(false)
    }
  }, [watchId])

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      
      if (permission.state === 'granted') {
        return true
      } else if (permission.state === 'prompt') {
        // Tentar obter localização para solicitar permissão
        return new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 5000 }
          )
        })
      } else {
        return false
      }
    } catch (error) {
      console.error('Erro ao verificar permissão de geolocalização:', error)
      return false
    }
  }, [isSupported])

  // Auto-start watching if enabled
  useEffect(() => {
    if (watchPosition && isSupported) {
      startWatching()
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchPosition, isSupported, startWatching, watchId])

  return {
    position,
    error,
    isLoading,
    isSupported,
    isWatching: watchId !== null,
    getCurrentPosition,
    startWatching,
    stopWatching,
    requestPermission
  }
}

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Permissão de localização negada. Ative a localização nas configurações do navegador.'
    case 2:
      return 'Localização indisponível. Verifique sua conexão e tente novamente.'
    case 3:
      return 'Tempo limite excedido ao obter localização. Tente novamente.'
    default:
      return 'Erro desconhecido ao obter localização.'
  }
}