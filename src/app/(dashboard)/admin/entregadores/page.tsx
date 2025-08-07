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

export default function EntregadoresPage() {
  const [entregadores, setEntregadores] = useState<Entregador[]>([])
  const [filteredEntregadores, setFilteredEntregadores] = useState<Entregador[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Mock data
  useEffect(() => {
    const mockEntregadores: Entregador[] = [
      {
        id: '1',
        nome: 'Carlos Silva',
        email: 'carlos@email.com',
        telefone: '(85) 99999-1111',
        cpf: '123.456.789-00',
        cnh: 'AB123456789',
        veiculo: 'Moto Honda CG 160',
        status: 'pendente',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria@email.com',
        telefone: '(85) 88888-2222',
        cpf: '987.654.321-00',
        cnh: 'AB987654321',
        veiculo: 'Moto Yamaha Factor',
        status: 'aprovado',
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-12T09:15:00Z',
      },
      {
        id: '3',
        nome: 'João Oliveira',
        email: 'joao@email.com',
        telefone: '(85) 77777-3333',
        cpf: '456.789.123-00',
        cnh: 'AB456789123',
        veiculo: 'Bicicleta Elétrica',
        status: 'rejeitado',
        created_at: '2024-01-08T16:45:00Z',
        updated_at: '2024-01-09T11:30:00Z',
      },
    ]

    setTimeout(() => {
      setEntregadores(mockEntregadores)
      setFilteredEntregadores(mockEntregadores)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (query: string) => {
    const filtered = entregadores.filter(entregador =>
      entregador.nome.toLowerCase().includes(query.toLowerCase()) ||
      entregador.email.toLowerCase().includes(query.toLowerCase()) ||
      entregador.cpf.includes(query)
    )
    setFilteredEntregadores(filtered)
  }

  const handleFilter = (filters: Record<string, any>) => {
    let filtered = [...entregadores]

    if (filters.status) {
      filtered = filtered.filter(entregador => entregador.status === filters.status)
    }

    setFilteredEntregadores(filtered)
  }

  const handleAction = async (actionKey: string, entregador: Entregador) => {
    setActionLoading(`${actionKey}-${entregador.id}`)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (actionKey === 'approve') {
        const updatedEntregadores = entregadores.map(e =>
          e.id === entregador.id ? { ...e, status: 'aprovado' as const } : e
        )
        setEntregadores(updatedEntregadores)
        setFilteredEntregadores(updatedEntregadores)
        
        toast({
          title: 'Entregador aprovado',
          description: `${entregador.nome} foi aprovado com sucesso.`,
        })
      } else if (actionKey === 'reject') {
        const updatedEntregadores = entregadores.map(e =>
          e.id === entregador.id ? { ...e, status: 'rejeitado' as const } : e
        )
        setEntregadores(updatedEntregadores)
        setFilteredEntregadores(updatedEntregadores)
        
        toast({
          title: 'Entregador rejeitado',
          description: `${entregador.nome} foi rejeitado.`,
          variant: 'destructive',
        })
      } else if (actionKey === 'view') {
        toast({
          title: 'Visualizar entregador',
          description: `Abrindo detalhes de ${entregador.nome}`,
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

  const getActions = (entregador: Entregador): ActionItem[] => {
    const actions: ActionItem[] = [
      { key: 'view', label: 'Ver Detalhes', variant: 'default' }
    ]

    if (entregador.status === 'pendente') {
      actions.push(
        { key: 'approve', label: 'Aprovar', variant: 'success' },
        { key: 'reject', label: 'Rejeitar', variant: 'destructive' }
      )
    }

    return actions
  }

  const columns: ColumnDef<Entregador>[] = [
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
      key: 'telefone',
      header: 'Telefone',
      sortable: true,
    },
    {
      key: 'cpf',
      header: 'CPF',
      sortable: true,
    },
    {
      key: 'veiculo',
      header: 'Veículo',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (entregador) => <StatusBadge status={entregador.status} />,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Ações',
      cell: (entregador) => (
        <ActionButtons
          actions={getActions(entregador)}
          onAction={(actionKey) => handleAction(actionKey, entregador)}
          loading={actionLoading === `approve-${entregador.id}` ? 'approve' : 
                   actionLoading === `reject-${entregador.id}` ? 'reject' :
                   actionLoading === `view-${entregador.id}` ? 'view' : undefined}
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
        Novo Entregador
      </Button>
    </>
  )

  return (
    <AdminPageLayout
      title="Gerenciar Entregadores"
      description="Visualize e gerencie todos os entregadores cadastrados no sistema"
      actions={actions}
    >
      <FilterBar
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filterOptions}
        searchPlaceholder="Buscar por nome, email ou CPF..."
      />
      
      <DataTable
        data={filteredEntregadores}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum entregador encontrado"
      />
    </AdminPageLayout>
  )
}