'use client'

import { useState, useEffect } from 'react'
import { useAuthSelectors } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'

export interface Rating {
  id: string
  pedido_id: string
  avaliador_id: string
  avaliador_nome: string
  avaliado_id: string
  avaliado_nome: string
  tipo_avaliacao: 'empresa' | 'entregador' | 'consumidor'
  
  // Critérios de avaliação
  nota_geral: number
  nota_qualidade?: number
  nota_atendimento?: number
  nota_pontualidade?: number
  nota_embalagem?: number
  
  comentario?: string
  pontos_positivos?: string[]
  pontos_negativos?: string[]
  
  // Resposta do avaliado
  resposta?: string
  respondido_em?: string
  
  // Metadata
  created_at: string
  updated_at: string
  
  // Dados do pedido
  pedido_numero?: string
  pedido_total?: number
}

export interface RatingStats {
  media_geral: number
  total_avaliacoes: number
  distribuicao: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  criterios: {
    qualidade: number
    atendimento: number
    pontualidade: number
    embalagem: number
  }
  badges: string[]
}

export function useRatings() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthSelectors()

  const fetchRatings = async (targetId?: string, type?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (targetId) params.append('targetId', targetId)
      if (type) params.append('type', type)

      const response = await fetch(`/api/ratings?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar avaliações')
      }

      setRatings(data.ratings || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const createRating = async (ratingData: Partial<Rating>) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para avaliar',
        variant: 'destructive'
      })
      return false
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...ratingData,
          avaliador_id: user.id,
          avaliador_nome: user.user_metadata?.nome || user.email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar avaliação')
      }

      // Atualizar lista local
      setRatings(prev => [data.rating, ...prev])

      toast({
        title: 'Avaliação enviada!',
        description: 'Obrigado pelo seu feedback'
      })

      return true
    } catch (err) {
      console.error('Erro ao criar avaliação:', err)
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao enviar avaliação',
        variant: 'destructive'
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const replyToRating = async (ratingId: string, resposta: string) => {
    if (!user) return false

    setIsLoading(true)

    try {
      const response = await fetch(`/api/ratings/${ratingId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resposta })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao responder avaliação')
      }

      // Atualizar lista local
      setRatings(prev => prev.map(rating => 
        rating.id === ratingId 
          ? { ...rating, resposta, respondido_em: new Date().toISOString() }
          : rating
      ))

      toast({
        title: 'Resposta enviada!',
        description: 'Sua resposta foi publicada'
      })

      return true
    } catch (err) {
      console.error('Erro ao responder avaliação:', err)
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao enviar resposta',
        variant: 'destructive'
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const getMyRatings = () => {
    return ratings.filter(rating => rating.avaliador_id === user?.id)
  }

  const getRatingsForMe = () => {
    return ratings.filter(rating => rating.avaliado_id === user?.id)
  }

  const canRatePedido = (pedidoId: string) => {
    return !ratings.some(rating => 
      rating.pedido_id === pedidoId && rating.avaliador_id === user?.id
    )
  }

  const getRatingForPedido = (pedidoId: string) => {
    return ratings.find(rating => 
      rating.pedido_id === pedidoId && rating.avaliador_id === user?.id
    )
  }

  return {
    ratings,
    stats,
    isLoading,
    error,
    fetchRatings,
    createRating,
    replyToRating,
    getMyRatings,
    getRatingsForMe,
    canRatePedido,
    getRatingForPedido
  }
}