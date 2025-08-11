'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { GarcomWithStats, GarcomFormData } from '@/types/garcom'

export function useGarcons() {
  const [garcons, setGarcons] = useState<GarcomWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadGarcons = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/empresa/garcons')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar garçons')
      }
      
      const data = await response.json()
      setGarcons(data.garcons || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const criarGarcom = async (garcomData: GarcomFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/empresa/garcons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(garcomData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar garçom')
      }

      const novoGarcom = await response.json()
      
      // Adicionar o novo garçom à lista local
      setGarcons(prev => [...prev, {
        ...novoGarcom,
        totalPedidosHoje: 0,
        vendaTotal: 0
      }])

      toast({
        title: 'Sucesso',
        description: `Garçom ${garcomData.nome} foi cadastrado com sucesso`,
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar garçom'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    }
  }

  const atualizarGarcom = async (id: string, garcomData: Partial<GarcomFormData>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/empresa/garcons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(garcomData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar garçom')
      }

      const garcomAtualizado = await response.json()
      
      // Atualizar o garçom na lista local
      setGarcons(prev => prev.map(g => 
        g.id === id 
          ? { ...g, ...garcomAtualizado }
          : g
      ))

      toast({
        title: 'Sucesso',
        description: `Garçom ${garcomAtualizado.nome} foi atualizado com sucesso`,
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar garçom'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    }
  }

  const toggleStatusGarcom = async (id: string): Promise<boolean> => {
    try {
      const garcom = garcons.find(g => g.id === id)
      if (!garcom) {
        throw new Error('Garçom não encontrado')
      }

      const response = await fetch(`/api/empresa/garcons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: !garcom.ativo }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao alterar status do garçom')
      }

      const garcomAtualizado = await response.json()
      
      // Atualizar o status na lista local
      setGarcons(prev => prev.map(g => 
        g.id === id 
          ? { ...g, ativo: garcomAtualizado.ativo }
          : g
      ))

      toast({
        title: 'Sucesso',
        description: `Garçom ${garcom.ativo ? 'desativado' : 'ativado'} com sucesso`,
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    }
  }

  const removerGarcom = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/empresa/garcons/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao remover garçom')
      }

      // Remover da lista local
      setGarcons(prev => prev.filter(g => g.id !== id))

      toast({
        title: 'Sucesso',
        description: 'Garçom removido com sucesso',
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover garçom'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    }
  }

  // Carregar garçons na inicialização
  useEffect(() => {
    loadGarcons()
  }, [])

  return {
    garcons,
    loading,
    error,
    loadGarcons,
    criarGarcom,
    atualizarGarcom,
    toggleStatusGarcom,
    removerGarcom,
    // Estatísticas calculadas
    totalGarcons: garcons.length,
    garconsAtivos: garcons.filter(g => g.ativo).length,
    totalPedidosHoje: garcons.reduce((acc, g) => acc + g.totalPedidosHoje, 0),
    totalVendasHoje: garcons.reduce((acc, g) => acc + g.vendaTotal, 0),
  }
}