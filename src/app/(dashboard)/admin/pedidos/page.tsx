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

interface Pedido {
  id: string
  cliente_nome: string
  empresa_nome: string
  entregador_nome?: string
  status: 'pendente' | 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado'
  valor_total: number
  taxa_entrega: number
  created_at: string
  updated_at: string
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Mock data
  useEffect(() => {
    const mockPedidos: Pedido[] = [
      {
        id: '1',
        cliente_nome: 'Ana Costa',
        empresa_nome: 'Pizzaria do João',
        entregador_nome: 'Carlos Silva',
        status: 'saiu_entrega',
        valor_total: 45.90,
        taxa_entrega: 5.00,
        created_at: '2024-01-15T19:30:00Z',
        updated_at: '2024-01-15T20:15:00Z',
      },
      {
        id: '2',
        cliente_nome: 'Pedro Almeida',
        empresa_nome: 'Hamburgueria Gourmet',
        entregador_nome: 'Maria Santos',
        status: 'entregue',
        valor_total: 32.50,
        taxa_entrega: 4.00,
        created_at: '2024-01-15T18:45:00Z',
        updated_at: '2024-01-15T19:30:00Z',
      },
      {
        id: '3',
        cliente_nome: 'Lucia Ferreira',
        empresa_nome: 'Restaurante Tempero Caseiro',
        status: 'preparando',
        valor_total: 28.90,
        taxa_entrega: 3.50,
        created_at: '2024-01-15T20:00:00Z',
        updated_at: '2024-01-15T20:10:00Z',
      },
      {
        id: '4',
        cliente_nome: 'Roberto Silva',
        empresa_nome: 'Pizzaria do João',
        status: 'cancelado',
        valor_total: 55.00,
        taxa_entrega: 6.00,
        created_at: '2024-01-15T17:30:00Z',
        updated_at: '2024-01-15T17:45:00Z',
      },
    ]

    setTimeout(() => {
      setPedidos(mockPedidos)
      setFilteredPedidos(mockPedidos)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (query: string) => {
    const filtered = pedidos.filter(pedido =>
      pedido.id.includes(query) ||
      pedido.cliente_nome.toLowerCase().includes(query.toLowerCase()) ||
      pedido.empresa_nome.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredPedidos(filtered)
  }

  const handleFilter = (filters: Record<string, any>) => {
    let filtered = [...pedidos]

    if (filters.status) {
      filtered = filtered.filter(pedido => pedido.status === filters.status)
    }

    setFilteredPedidos(filtered)
  }

  const handleAction = async (actionKey: string, pedido: Pedido) => {
    setActionLoading(`${actionKey}-${pedido.id}`)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (actionKey === 'view') {
        toast({
          title: 'Visualizar pedido',
          description: `Abrindo detalhes do pedido #${pedido.id}`,
        })
      } else if (actionKey === 'cancel') {
        const updatedPedidos = pedidos.map(p =>
          p.id === pedido.id ? { ...p, status: 'cancelado' as const } : p
        )
        setPedidos(updatedPedidos)
        setFilteredPedidos(updatedPedidos)
        
        toast({
          title: 'Pedido cancelado',
          description: `Pedido #${pedido.id} foi cancelado.`,
          variant: 'destructive',
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

  const getActions = (pedido: Pedido): ActionItem[] => {
    const actions: ActionItem[] = [
      { key: 'view', label: 'Ver Detalhes', variant: 'default' }
    ]

    if (pedido.status !== 'entregue' && pedido.status !== 'cancelado') {
      actions.push({ key: 'cancel', label: 'Cancelar', variant: 'destructive' })
    }

    return actions
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const columns: ColumnDef<Pedido>[] = [
    {
      key: 'id',
      header: 'ID',
      cell: (pedido) => `#${pedido.id}`,
      sortable: true,
    },
    {
      key: 'cliente_nome',
      header: 'Cliente',
      sortable: true,
    },
    {
      key: 'empresa_nome',
      header: 'Empresa',
      sortable: true,
    },
    {
      key: 'entregador_nome',
      header: 'Entregador',
      cell: (pedido) => pedido.entregador_nome || '-',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (pedido) => <StatusBadge status={pedido.status} />,
      sortable: true,
    },
    {
      key: 'valor_total',
      header: 'Valor Total',
      cell: (pedido) => formatCurrency(pedido.valor_total),
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Data',
      cell: (pedido) => new Date(pedido.created_at).toLocaleDateString('pt-BR'),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Ações',
      cell: (pedido) => (
        <ActionButtons
          actions={getActions(pedido)}
          onAction={(actionKey) => handleAction(actionKey, pedido)}
          loading={actionLoading === `view-${pedido.id}` ? 'view' :
                   actionLoading === `cancel-${pedido.id}` ? 'cancel' : undefined}
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
        { value: 'confirmado', label: 'Confirmado' },
        { value: 'preparando', label: 'Preparando' },
        { value: 'saiu_entrega', label: 'Saiu para Entrega' },
        { value: 'entregue', label: 'Entregue' },
        { value: 'cancelado', label: 'Cancelado' },
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
      title="Gerenciar Pedidos"
      description="Visualize e monitore todos os pedidos realizados no sistema"
      actions={actions}
    >
      <FilterBar
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filterOptions}
        searchPlaceholder="Buscar por ID, cliente ou empresa..."
      />
      
      <DataTable
        data={filteredPedidos}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum pedido encontrado"
      />
    </AdminPageLayout>
  )
}