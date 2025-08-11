'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { usePedidosLocais } from '@/hooks/use-pedidos-locais'
import { 
  Plus, 
  LogOut, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Utensils,
  Bell,
  RefreshCw
} from 'lucide-react'

interface GarcomData {
  id: string
  nome: string
  usuario: string
  empresa: {
    id: string
    nome: string
  }
  permissoes: {
    criar_pedidos: boolean
    editar_pedidos: boolean
    cancelar_pedidos: boolean
  }
}

interface PedidoLocal {
  id: string
  mesa: string
  status: string
  total: number
  created_at: string
  itens: Array<{
    id: string
    produto: {
      nome: string
    }
    quantidade: number
  }>
  observacoes_garcom?: string
}

export default function ComandaDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [garcom, setGarcom] = useState<GarcomData | null>(null)
  
  const {
    pedidos,
    loading,
    error,
    loadPedidos,
    totalPedidos,
    pedidosPendentes,
    pedidosProntos,
    totalVendas
  } = usePedidosLocais()

  useEffect(() => {
    loadGarcomData()
  }, [])

  const loadGarcomData = () => {
    try {
      const garcomData = localStorage.getItem('garcom_data')
      if (garcomData) {
        setGarcom(JSON.parse(garcomData))
      } else {
        router.push('/comanda/login')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do garçom:', error)
      router.push('/comanda/login')
    }
  }

  const refreshPedidos = async () => {
    await loadPedidos()
    toast({
      title: 'Atualizado',
      description: 'Lista de pedidos atualizada'
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('garcom_token')
    localStorage.removeItem('garcom_data')
    router.push('/comanda/login')
  }

  const handleNovoPedido = () => {
    if (!garcom?.permissoes.criar_pedidos) {
      toast({
        title: 'Sem permissão',
        description: 'Você não tem permissão para criar pedidos',
        variant: 'destructive'
      })
      return
    }
    
    // Navegar para tela de novo pedido (será implementada)
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de novo pedido será implementada em breve'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { variant: 'secondary' as const, icon: Clock, label: 'Pendente' },
      preparando: { variant: 'default' as const, icon: Utensils, label: 'Preparando' },
      pronto: { variant: 'default' as const, icon: CheckCircle, label: 'Pronto' },
      entregue: { variant: 'outline' as const, icon: CheckCircle, label: 'Entregue' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeElapsed = (dateString: string) => {
    const now = new Date()
    const created = new Date(dateString)
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Agora'
    if (diffMinutes < 60) return `${diffMinutes}min`
    
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return `${hours}h ${minutes}min`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sobral-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Utensils className="h-8 w-8 text-sobral-red-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Sistema de Comanda
                </h1>
                <p className="text-sm text-gray-500">
                  {garcom?.empresa.nome}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {garcom?.nome}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPedidos}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meus Pedidos</h2>
            <p className="text-gray-600">
              {pedidos.length} pedidos ativos
            </p>
          </div>
          
          <Button
            onClick={handleNovoPedido}
            className="bg-sobral-red-600 hover:bg-sobral-red-700"
            disabled={!garcom?.permissoes.criar_pedidos}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidos.length}</div>
              <p className="text-xs text-muted-foreground">pedidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pedidos.filter(p => p.status === 'pendente').length}
              </div>
              <p className="text-xs text-muted-foreground">aguardando</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prontos</CardTitle>
              <Bell className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pedidos.filter(p => p.status === 'pronto').length}
              </div>
              <p className="text-xs text-muted-foreground">para entregar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(pedidos.reduce((acc, p) => acc + p.total, 0))}
              </div>
              <p className="text-xs text-muted-foreground">hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Pedidos List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Mesa {pedido.mesa}</CardTitle>
                    <CardDescription>
                      {formatTime(pedido.created_at)} • {getTimeElapsed(pedido.created_at)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(pedido.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Itens */}
                <div className="space-y-1">
                  {pedido.itens.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantidade}x {item.produto.nome}</span>
                    </div>
                  ))}
                </div>

                {/* Observações */}
                {pedido.observacoes_garcom && (
                  <div className="p-2 bg-yellow-50 rounded text-xs">
                    <strong>Obs:</strong> {pedido.observacoes_garcom}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(pedido.total)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {garcom?.permissoes.editar_pedidos && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Editar
                    </Button>
                  )}
                  {pedido.status === 'pronto' && (
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      Entregar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {pedidos.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido ativo
              </h3>
              <p className="text-gray-600 mb-4">
                Você não possui pedidos ativos no momento.
              </p>
              {garcom?.permissoes.criar_pedidos && (
                <Button 
                  onClick={handleNovoPedido}
                  className="bg-sobral-red-600 hover:bg-sobral-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Pedido
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}