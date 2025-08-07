'use client'

import { useState, useEffect } from 'react'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { DataTable, ColumnDef } from '@/components/admin/data-table'
import { FilterBar, FilterOption } from '@/components/admin/filter-bar'
import { StatusBadge } from '@/components/admin/status-badge'
import { ActionButtons, ActionItem } from '@/components/admin/action-buttons'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
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

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Mock data for now - will be replaced with API calls
  useEffect(() => {
    const mockEmpresas: Empresa[] = [
      {
        id: '1',
        nome: 'Pizzaria do João',
        email: 'contato@pizzariadojoao.com',
        telefone: '(85) 99999-9999',
        endereco: 'Rua das Flores, 123 - Centro',
        cnpj: '12.345.678/0001-90',
        status: 'pendente',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        nome: 'Hamburgueria Gourmet',
        email: 'contato@hamburgeriagourmet.com',
        telefone: '(85) 88888-8888',
        endereco: 'Av. Principal, 456 - Aldeota',
        cnpj: '98.765.432/0001-10',
        status: 'aprovado',
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-12T09:15:00Z',
      },
      {
        id: '3',
        nome: 'Restaurante Tempero Caseiro',
        email: 'contato@temperocaseiro.com',
        telefone: '(85) 77777-7777',
        endereco: 'Rua do Comércio, 789 - Meireles',
        cnpj: '11.222.333/0001-44',
        status: 'rejeitado',
        created_at: '2024-01-08T16:45:00Z',
        updated_at: '2024-01-09T11:30:00Z',
      },
    ]

    setTimeout(() => {
      setEmpresas(mockEmpresas)
      setFilteredEmpresas(mockEmpresas)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (query: string) => {
    const filtered = empresas.filter(empresa =>
      empresa.nome.toLowerCase().includes(query.toLowerCase()) ||
      empresa.email.toLowerCase().includes(query.toLowerCase()) ||
      empresa.cnpj.includes(query)
    )
    setFilteredEmpresas(filtered)
  }

  const handleFilter = (filters: Record<string, any>) => {
    let filtered = [...empresas]

    if (filters.status) {
      filtered = filtered.filter(empresa => empresa.status === filters.status)
    }

    setFilteredEmpresas(filtered)
  }

  const handleAction = async (actionKey: string, empresa: Empresa) => {
    setActionLoading(`${actionKey}-${empresa.id}`)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (actionKey === 'approve') {
        // Update empresa status to approved
        const updatedEmpresas = empresas.map(e =>
          e.id === empresa.id ? { ...e, status: 'aprovado' as const } : e
        )
        setEmpresas(updatedEmpresas)
        setFilteredEmpresas(updatedEmpresas)
        
        toast({
          title: 'Empresa aprovada',
          description: `${empresa.nome} foi aprovada com sucesso.`,
        })
      } else if (actionKey === 'reject') {
        // Update empresa status to rejected
        const updatedEmpresas = empresas.map(e =>
          e.id === empresa.id ? { ...e, status: 'rejeitado' as const } : e
        )
        setEmpresas(updatedEmpresas)
        setFilteredEmpresas(updatedEmpresas)
        
        toast({
          title: 'Empresa rejeitada',
          description: `${empresa.nome} foi rejeitada.`,
          variant: 'destructive',
        })
      } else if (actionKey === 'view') {
        // Open empresa details modal (to be implemented)
        toast({
          title: 'Visualizar empresa',
          description: `Abrindo detalhes de ${empresa.nome}`,
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar a ação.',
        variant: 'destructive',
      })
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
        data={filteredEmpresas}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhuma empresa encontrada"
      />
    </AdminPageLayout>
  )
}