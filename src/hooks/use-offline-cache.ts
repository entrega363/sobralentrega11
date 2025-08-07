'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  endpoint: string
  data: any
  timestamp: number
}

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])
  const queryClient = useQueryClient()

  // Detectar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar status inicial
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Carregar ações pendentes do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('offline-actions')
    if (stored) {
      try {
        setPendingActions(JSON.parse(stored))
      } catch (error) {
        console.error('Erro ao carregar ações offline:', error)
      }
    }
  }, [])

  // Salvar ações pendentes no localStorage
  useEffect(() => {
    localStorage.setItem('offline-actions', JSON.stringify(pendingActions))
  }, [pendingActions])

  // Processar ações pendentes quando voltar online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      processPendingActions()
    }
  }, [isOnline, pendingActions])

  const addOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }

    setPendingActions(prev => [...prev, newAction])
  }

  const processPendingActions = async () => {
    const actionsToProcess = [...pendingActions]
    
    for (const action of actionsToProcess) {
      try {
        await executeOfflineAction(action)
        
        // Remover ação processada
        setPendingActions(prev => prev.filter(a => a.id !== action.id))
        
        console.log('Ação offline processada:', action)
      } catch (error) {
        console.error('Erro ao processar ação offline:', action, error)
        
        // Se a ação falhou, mantê-la para tentar novamente
        // Mas remover ações muito antigas (mais de 24h)
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000
        if (action.timestamp < dayAgo) {
          setPendingActions(prev => prev.filter(a => a.id !== action.id))
        }
      }
    }

    // Invalidar cache após processar ações
    if (actionsToProcess.length > 0) {
      queryClient.invalidateQueries()
    }
  }

  const executeOfflineAction = async (action: OfflineAction) => {
    const method = {
      create: 'POST',
      update: 'PUT',
      delete: 'DELETE',
    }[action.type]

    const response = await fetch(`/api${action.endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: action.type !== 'delete' ? JSON.stringify(action.data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  }

  // Cache dados para uso offline
  const cacheForOffline = (key: string, data: any) => {
    try {
      localStorage.setItem(`offline-cache-${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.error('Erro ao cachear dados offline:', error)
    }
  }

  // Recuperar dados do cache offline
  const getOfflineCache = (key: string, maxAge: number = 60 * 60 * 1000) => {
    try {
      const stored = localStorage.getItem(`offline-cache-${key}`)
      if (!stored) return null

      const { data, timestamp } = JSON.parse(stored)
      
      // Verificar se os dados não estão muito antigos
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`offline-cache-${key}`)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao recuperar cache offline:', error)
      return null
    }
  }

  return {
    isOnline,
    pendingActions: pendingActions.length,
    addOfflineAction,
    cacheForOffline,
    getOfflineCache,
  }
}