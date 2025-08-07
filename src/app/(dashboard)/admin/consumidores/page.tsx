'use client'

import { useState, useEffect } from 'react'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { DataTable, ColumnDef } from '@/components/admin/data-table'
import { FilterBar, FilterOption } from '@/components/admin/filter-bar'
import { StatusBadge } from '@/components/admin/status-badge'
import { ActionButtons, ActionItem } from '@/components/admin/action-buttons'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Consumidor {
  id: string
  nome: string
  email: string
  telefone: string
  total_pedidos: number
  status: 'ativo' | 'inativo'
  created_at: string
  updated_at: string
}

export default function ConsumidoresPage() {
  const [consumidores, setConsumidores] = useState<Consumidor[]>([])
  const [filteredConsumidores, setFilteredConsumidores] = useState<Consumidor[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Mock data
  useEffect(() => {
    const mockConsumidores: Consumidor[] = [
      {
        id: '1',
        nome: 'Ana Costa',
        email: 'ana@email.com',
        telefone: '(85) 99999-1111',
        total_pedidos: 15,
        status: 'ativo',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        nome: 'Pedro Almeida',
        email: 'pedro@email.com',
        telefone: '(85) 88888-2222',
        total_pedidos: 8,
        status: 'ativo',
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-12T09:15:00Z',
      },
      {
        id: '3',
        nome: 'Lucia Ferreira',
        email: 'lucia@email.com',
        telefone: '(85) 77777-3333',
        total_pedidos: 3,
        status: 'inativo',
        created_at: '2024-01-08T16:45:00Z',
        updated_at: '2024-01-09T11:30:00Z',
      },
    ]

    setTimeout(() => {
      setConsumidores(mockConsumidores)
      setFilteredConsumidores(mockConsumidores)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (query: string) => {
    const filtered = consumidores.filter(consumidor =>
      consumidor.nome.toLowerCase().includes(query.toLowerCase()) ||
      consumidor.email.toLowerCase().includes(query.toLowerCase()) ||
      consumidor.telefone.includes(query)
    )
    setFilteredConsumidores(filtered)
  }

  const handleFilter = (filters: Record<string, any>) => {
    let filtered = [...consumidores]

    if (filters.status) {
      filtered = filtered.filter(consumidor => consumidor.status === filters.status)
    }

    setFilteredConsumidores(filtered)
  }

  const handleAction = async (actionKey: string, consumidor: Consumidor) => {
    setActionLoading(`${actionKey}-${consumidor.id}`)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (actionKey === 'activate') {
        const updatedConsumidores = consumidores.map(c =>
          c.id === consumidor.id ? { ...c, status: 'ativo' as const } : c
        )
        setConsumidores(updatedConsumidores)
        setFilteredConsumidores(updatedConsumidores)
        
        toast({
          title: 'Consumidor ativado',
          description: `${consumidor.nome} foi ativado com sucesso.`,
        })
      } else if (actionKey === 'deactivate') {
        const updatedConsumidores = consumidores.map(c =>
          c.id === consumidor.id ? { ...c, status: 'inativo' as const } : c
        )
        setConsumidores(updatedConsumidores)
        setFilteredConsumidores(updatedConsumidores)
        
        toast({
          title: 'Consumidor desativado',
          description: `${consumidor.nome} foi desativado.`,
          variant: 'destructive',
        })
      } else if (actionKey === 'view') {
        toast({
          title: 'Visualizar consumidor',
          description: `Abrindo histórico de ${consumidor.nome}`,
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

  const getActions = (consumidor: Consumidor): ActionItem[] => {
    const actions: ActionItem[] = [
      { key: 'view', label: 'Ver Histórico', variant: 'default' }
    ]

    if (consumidor.status === 'ativo') {
      actions.push({ key: 'deactivate', label: 'Desativar', variant: 'destructive' })
    } else {
      actions.push({ key: 'activate', label: 'Ativar', variant: 'success' })
    }

    return actions
  }

  const columns: ColumnDef<Consumidor>[] = [
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
      key: 'total_pedidos',
      header: 'Total Pedidos',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (consumidor) => <StatusBadge status={consumidor.status} />,
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Data Cadastro',
      cell: (consumidor) => new Date(consumidor.created_at).toLocaleDateString('pt-BR'),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Ações',
      cell: (consumidor) => (
        <ActionButtons
          actions={getActions(consumidor)}
          onAction={(actionKey) => handleAction(actionKey, consumidor)}
          loading={actionLoading === `activate-${consumidor.id}` ? 'activate' : 
                   actionLoading === `deactivate-${consumidor.id}` ? 'deactivate' :
                   actionLoading === `view-${consumidor.id}` ? 'view' : undefined}
        />
      ),
    },
  ]

  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' },
      ],
    },
  ]

  const actions = (
    <Button variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exportar
    </Button>
  )

  return (
    <AdminPageLayout
      title="Gerenciar Consumidores"
      description="Visualize e gerencie todos os consumidores cadastrados no sistema"
      actions={actions}
    >
      <FilterBar
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filterOptions}
        searchPlaceholder="Buscar por nome, email ou telefone..."
      />
      
      <DataTable
        data={filteredConsumidores}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum consumidor encontrado"
      />
    </AdminPageLayout>
  )
}