import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

interface Empresa {
  id: string
  nome: string
  email: string
  telefone: string
  endereco: string
  cnpj: string
  status: 'aprovado' | 'pendente' | 'rejeitado'
  created_at: string
  updated_at: string
}

interface UseEmpresasParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

interface UseEmpresasReturn {
  empresas: Empresa[]
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

export function useAdminEmpresas(params: UseEmpresasParams = {}): UseEmpresasReturn {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    total: 0,
    totalPages: 0
  })

  const fetchEmpresas = async () => {
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

      const response = await fetch(`/api/admin/empresas?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar empresas')
      }

      const data = await response.json()
      
      if (data.success) {
        setEmpresas(data.data.empresas)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar empresas'
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
      const response = await fetch(`/api/admin/empresas/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, motivo }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da empresa')
      }

      const data = await response.json()
      
      if (data.success) {
        // Atualizar a empresa na lista local
        setEmpresas(prev => 
          prev.map(empresa => 
            empresa.id === id 
              ? { ...empresa, status, updated_at: new Date().toISOString() }
              : empresa
          )
        )

        toast({
          title: 'Status atualizado',
          description: `Empresa ${status === 'aprovado' ? 'aprovada' : 'rejeitada'} com sucesso.`,
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
    fetchEmpresas()
  }

  useEffect(() => {
    fetchEmpresas()
  }, [pagination.page, pagination.pageSize, params.status, params.search])

  return {
    empresas,
    loading,
    error,
    pagination,
    refetch,
    updateStatus
  }
}