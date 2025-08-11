'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthSelectors } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'

export interface AnalyticsData {
  // Métricas gerais
  totalPedidos: number
  totalVendas: number
  ticketMedio: number
  crescimentoMensal: number
  
  // Métricas por período
  pedidosHoje: number
  vendasHoje: number
  pedidosSemana: number
  vendasSemana: number
  pedidosMes: number
  vendasMes: number
  
  // Dados para gráficos
  vendasPorDia: Array<{ data: string; valor: number; pedidos: number }>
  pedidosPorStatus: Array<{ status: string; quantidade: number; percentual: number }>
  topProdutos: Array<{ nome: string; vendas: number; receita: number }>
  avaliacaoMedia: number
  
  // Métricas específicas por tipo de usuário
  empresaMetrics?: {
    produtosMaisPedidos: Array<{ nome: string; quantidade: number }>
    horariosPopulares: Array<{ hora: number; pedidos: number }>
    avaliacoesPorCriterio: Record<string, number>
  }
  
  entregadorMetrics?: {
    entregasRealizadas: number
    tempoMedioEntrega: number
    distanciaPercorrida: number
    avaliacaoEntregador: number
    ganhosDiarios: Array<{ data: string; valor: number }>
  }
  
  consumidorMetrics?: {
    pedidosRealizados: number
    gastoTotal: number
    restauranteFavorito: string
    categoriaPreferida: string
    economiaComPromocoes: number
  }
  
  adminMetrics?: {
    usuariosAtivos: number
    novasEmpresas: number
    novosEntregadores: number
    taxaConversao: number
    receitaPlataforma: number
  }
}

export function useAnalytics(periodo: '7d' | '30d' | '90d' = '30d') {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthSelectors()
  const supabase = createClient()

  const fetchAnalytics = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics?periodo=${periodo}&userId=${user.id}&userType=${user.user_metadata?.role}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar analytics')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      console.error('Erro ao buscar analytics:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }, [user, periodo, supabase])

  const getKPIs = useCallback(() => {
    if (!data || !user) return []

    const userRole = user.user_metadata?.role

    switch (userRole) {
      case 'empresa':
        return [
          {
            title: 'Pedidos Hoje',
            value: data.pedidosHoje,
            change: '+12%',
            trend: 'up' as const,
            icon: '📦'
          },
          {
            title: 'Vendas Hoje',
            value: `R$ ${data.vendasHoje.toFixed(2)}`,
            change: '+8%',
            trend: 'up' as const,
            icon: '💰'
          },
          {
            title: 'Ticket Médio',
            value: `R$ ${data.ticketMedio.toFixed(2)}`,
            change: '+5%',
            trend: 'up' as const,
            icon: '🎯'
          },
          {
            title: 'Avaliação',
            value: data.avaliacaoMedia.toFixed(1),
            change: '+0.2',
            trend: 'up' as const,
            icon: '⭐'
          }
        ]

      case 'entregador':
        return [
          {
            title: 'Entregas Hoje',
            value: data.entregadorMetrics?.entregasRealizadas || 0,
            change: '+3',
            trend: 'up' as const,
            icon: '🚚'
          },
          {
            title: 'Tempo Médio',
            value: `${data.entregadorMetrics?.tempoMedioEntrega || 0}min`,
            change: '-2min',
            trend: 'up' as const,
            icon: '⏱️'
          },
          {
            title: 'Avaliação',
            value: (data.entregadorMetrics?.avaliacaoEntregador || 0).toFixed(1),
            change: '+0.1',
            trend: 'up' as const,
            icon: '⭐'
          },
          {
            title: 'Ganhos Hoje',
            value: `R$ ${data.vendasHoje.toFixed(2)}`,
            change: '+15%',
            trend: 'up' as const,
            icon: '💵'
          }
        ]

      case 'consumidor':
        return [
          {
            title: 'Pedidos Este Mês',
            value: data.consumidorMetrics?.pedidosRealizados || 0,
            change: '+2',
            trend: 'up' as const,
            icon: '🛒'
          },
          {
            title: 'Gasto Total',
            value: `R$ ${data.consumidorMetrics?.gastoTotal || 0}`,
            change: '+R$ 45',
            trend: 'up' as const,
            icon: '💳'
          },
          {
            title: 'Economia',
            value: `R$ ${data.consumidorMetrics?.economiaComPromocoes || 0}`,
            change: '+R$ 12',
            trend: 'up' as const,
            icon: '🎉'
          },
          {
            title: 'Favorito',
            value: data.consumidorMetrics?.restauranteFavorito || 'N/A',
            change: '',
            trend: 'neutral' as const,
            icon: '❤️'
          }
        ]

      case 'admin':
        return [
          {
            title: 'Usuários Ativos',
            value: data.adminMetrics?.usuariosAtivos || 0,
            change: '+12%',
            trend: 'up' as const,
            icon: '👥'
          },
          {
            title: 'Receita Plataforma',
            value: `R$ ${data.adminMetrics?.receitaPlataforma || 0}`,
            change: '+18%',
            trend: 'up' as const,
            icon: '💰'
          },
          {
            title: 'Taxa Conversão',
            value: `${data.adminMetrics?.taxaConversao || 0}%`,
            change: '+2.1%',
            trend: 'up' as const,
            icon: '📈'
          },
          {
            title: 'Novas Empresas',
            value: data.adminMetrics?.novasEmpresas || 0,
            change: '+5',
            trend: 'up' as const,
            icon: '🏪'
          }
        ]

      default:
        return []
    }
  }, [data, user])

  const getChartData = useCallback(() => {
    if (!data) return null

    return {
      vendas: data.vendasPorDia.map(item => ({
        name: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        vendas: item.valor,
        pedidos: item.pedidos
      })),
      status: data.pedidosPorStatus,
      produtos: data.topProdutos.slice(0, 5)
    }
  }, [data])

  const exportData = useCallback(async (format: 'csv' | 'pdf' | 'excel') => {
    if (!data || !user) return

    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
          format,
          periodo,
          userType: user.user_metadata?.role
        })
      })

      if (!response.ok) throw new Error('Erro ao exportar dados')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${periodo}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }, [data, user, periodo])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Atualizar dados a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchAnalytics])

  return {
    data,
    isLoading,
    error,
    kpis: getKPIs(),
    chartData: getChartData(),
    refetch: fetchAnalytics,
    exportData
  }
}