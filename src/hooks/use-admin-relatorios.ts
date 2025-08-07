import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

interface RelatorioData {
  metricas: {
    totalPedidos: number
    receitaTotal: number
    empresasAtivas: number
    entregadoresAtivos: number
    pedidosHoje: number
    receitaHoje: number
    crescimentoMensal: number
    ticketMedio: number
  }
  graficos: {
    pedidosPorDia: Array<{
      data: string
      pedidos: number
      receita: number
    }>
    topEmpresas: Array<{
      nome: string
      receita: number
      pedidos: number
    }>
  }
  periodo: {
    dias: number
    dataInicio: string
    dataFim: string
  }
}

interface UseRelatoriosParams {
  periodo?: number // dias
}

interface UseRelatoriosReturn {
  data: RelatorioData | null
  loading: boolean
  error: string | null
  refetch: () => void
  exportar: (formato: 'pdf' | 'excel') => Promise<void>
}

export function useAdminRelatorios(params: UseRelatoriosParams = {}): UseRelatoriosReturn {
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRelatorios = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      
      if (params.periodo) {
        searchParams.append('periodo', params.periodo.toString())
      }

      const response = await fetch(`/api/admin/relatorios?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar relatórios')
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Erro desconhecido')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar relatórios'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const exportar = async (formato: 'pdf' | 'excel') => {
    try {
      // Simular exportação por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Relatório exportado',
        description: `Relatório exportado em formato ${formato.toUpperCase()} com sucesso.`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar relatório'
      toast({
        title: 'Erro na exportação',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const refetch = () => {
    fetchRelatorios()
  }

  useEffect(() => {
    fetchRelatorios()
  }, [params.periodo])

  return {
    data,
    loading,
    error,
    refetch,
    exportar
  }
}