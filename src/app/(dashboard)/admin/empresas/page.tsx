'use client'

import { useState } from 'react'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { DataTable, ColumnDef } from '@/components/admin/data-table'
import { FilterBar, FilterOption } from '@/components/admin/filter-bar'
import { StatusBadge } from '@/components/admin/status-badge'
import { ActionButtons, ActionItem } from '@/components/admin/action-buttons'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import { useAdminEmpresas } from '@/hooks/use-admin-empresas'

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

export default function EmpresasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { empresas, loading, pagination, updateStatus, refetch } = useAdminEmpresas({
    search: searchQuery,
    status: statusFilter,
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (filters: Record<string, any>) => {
    setStatusFilter(filters.status || '')
  }

  const handleAction = async (actionKey: string, empresa: Empresa) => {
    setActionLoading(`${actionKey}-${empresa.id}`)

    try {
      if (actionKey === 'approve') {
        await updateStatus(empresa.id, 'aprovado')
      } else if (actionKey === 'reject') {
        await updateStatus(empresa.id, 'rejeitado')
      } else if (actionKey === 'view') {
        // Open empresa details modal (to be implemented)
        console.log('View empresa:', empresa)
      }
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setActionLoading(null)
    }
  }

  const getActions = (empresa: Empresa): ActionItem[] => {
    const actions: ActionItem[] = [
      { key: 'view', label: 'Ver Detalhes', variant: 'default' }
    ]

    if (empresa.status === 'pendente') {
      actions.push(
        { key: 'approve', label: 'Aprovar', variant: 'success' },
        { key: 'reject', label: 'Rejeitar', variant: 'destructive' }
      )
    }

    return actions
  }

  const columns: ColumnDef<Empresa>[] = [
    {
      key: 'nome',
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'cnpj',
      header: 'CNPJ',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (empresa) => <StatusBadge status={empresa.status} />,
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Data Cadastro',
      cell: (empresa) => new Date(empresa.created_at).toLocaleDateString('pt-BR'),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Ações',
      cell: (empresa) => (
        <ActionButtons
          actions={getActions(empresa)}
          onAction={(actionKey) => handleAction(actionKey, empresa)}
          loading={actionLoading === `approve-${empresa.id}` ? 'approve' : 
                   actionLoading === `reject-${empresa.id}` ? 'reject' :
                   actionLoading === `view-${empresa.id}` ? 'view' : undefined}
        />
      ),
    },
  ]

  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pendente', label: 'Pendente' },
        { value: 'aprovado', label: 'Aprovado' },
        { value: 'rejeitado', label: 'Rejeitado' },
      ],
    },
  ]

  const actions = (
    <>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
      <Button size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Nova Empresa
      </Button>
    </>
  )

  return (
    <AdminPageLayout
      title="Gerenciar Empresas"
      description="Visualize e gerencie todas as empresas cadastradas no sistema"
      actions={actions}
    >
      <FilterBar
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filterOptions}
        searchPlaceholder="Buscar por nome, email ou CNPJ..."
      />
      
      <DataTable
        data={empresas}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhuma empresa encontrada"
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: (page) => {
            // This would be handled by the hook in a real implementation
            console.log('Change page to:', page)
          }
        }}
      />
    </AdminPageLayout>
  )
}