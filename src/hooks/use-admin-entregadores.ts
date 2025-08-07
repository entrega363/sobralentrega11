import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

interface Entregador {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  cnh: string
  veiculo: string
  status: 'aprovado' | 'pendente' | 'rejeitado'
  created_at: string
  updated_at: string
}

interface UseEntregadoresParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

interface UseEntregadoresReturn {
  entregadores: Entregador[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  refetch: () => void
  updateStatus: (id: string, status: 'aprovado' | 'rejeitado', motivo?: string) => Promise<void>
}

export function useAdminEntregadores(params: UseEntregadoresParams = {}): UseEntregadoresReturn {
  const [entregadores, setEntregadores] = useState<Entregador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    total: 0,
    totalPages: 0
  })

  const fetchEntregadores = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      })

      if (params.status) {
        searchParams.append('status', params.status)
      }

      if (params.search) {
        searchParams.append('search', params.search)
      }

      const response = await fetch(`/api/admin/entregadores?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar entregadores')
      }

      const data = await response.json()
      
      if (data.success) {
        setEntregadores(data.data.entregadores)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar entregadores'
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

  const updateStatus = async (id: string, status: 'aprovado' | 'rejeitado', motivo?: string) => {
    try {
      const response = await fetch(`/api/admin/entregadores/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, motivo }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do entregador')
      }

      const data = await response.json()
      
      if (data.success) {
        // Atualizar o entregador na lista local
        setEntregadores(prev => 
          prev.map(entregador => 
            entregador.id === id 
              ? { ...entregador, status, updated_at: new Date().toISOString() }
              : entregador
          )
        )

        toast({
          title: 'Status atualizado',
          description: `Entregador ${status === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso.`,
        })
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const refetch = () => {
    fetchEntregadores()
  }

  useEffect(() => {
    fetchEntregadores()
  }, [pagination.page, pagination.pageSize, params.status, params.search])

  return {
    entregadores,
    loading,
    error,
    pagination,
    refetch,
    updateStatus
  }
}