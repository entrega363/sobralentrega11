'use client'

import { useState, useEffect } from 'react'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Calendar, TrendingUp, Users, Building2, Truck, ShoppingCart } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface RelatorioData {
  totalPedidos: number
  receitaTotal: number
  empresasAtivas: number
  entregadoresAtivos: number
  pedidosHoje: number
  receitaHoje: number
  crescimentoMensal: number
  ticketMedio: number
}

export default function RelatoriosPage() {
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [exportLoading, setExportLoading] = useState<string | null>(null)

  // Mock data
  useEffect(() => {
    const mockData: RelatorioData = {
      totalPedidos: 1247,
      receitaTotal: 45890.50,
      empresasAtivas: 23,
      entregadoresAtivos: 15,
      pedidosHoje: 34,
      receitaHoje: 1250.80,
      crescimentoMensal: 12.5,
      ticketMedio: 36.80,
    }

    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [periodo])

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportLoading(format)

    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Relatório exportado',
        description: `Relatório exportado em formato ${format.toUpperCase()} com sucesso.`,
      })
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao exportar o relatório.',
        variant: 'destructive',
      })
    } finally {
      setExportLoading(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const actions = (
    <div className="flex items-center space-x-3">
      <Select value={periodo} onValueChange={setPeriodo}>
        <SelectTrigger className="w-[150px]">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Últimos 7 dias</SelectItem>
          <SelectItem value="30">Últimos 30 dias</SelectItem>
          <SelectItem value="90">Últimos 90 dias</SelectItem>
          <SelectItem value="365">Último ano</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleExport('excel')}
        disabled={exportLoading === 'excel'}
      >
        {exportLoading === 'excel' ? (
          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Excel
      </Button>

      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={exportLoading === 'pdf'}
      >
        {exportLoading === 'pdf' ? (
          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        PDF
      </Button>
    </div>
  )

  if (loading || !data) {
    return (
      <AdminPageLayout
        title="Relatórios"
        description="Visualize métricas e estatísticas do sistema"
        actions={actions}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout
      title="Relatórios"
      description="Visualize métricas e estatísticas do sistema"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Pedidos"
            value={data.totalPedidos.toLocaleString('pt-BR')}
            icon={ShoppingCart}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Receita Total"
            value={formatCurrency(data.receitaTotal)}
            icon={TrendingUp}
            iconColor="text-green-600"
          />
          <StatCard
            title="Empresas Ativas"
            value={data.empresasAtivas}
            icon={Building2}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Entregadores Ativos"
            value={data.entregadoresAtivos}
            icon={Truck}
            iconColor="text-orange-600"
          />
        </div>

        {/* Métricas do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Pedidos Hoje"
            value={data.pedidosHoje}
            icon={ShoppingCart}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Receita Hoje"
            value={formatCurrency(data.receitaHoje)}
            icon={TrendingUp}
            iconColor="text-green-600"
          />
          <StatCard
            title="Crescimento Mensal"
            value={`+${data.crescimentoMensal}%`}
            icon={TrendingUp}
            iconColor="text-green-600"
          />
          <StatCard
            title="Ticket Médio"
            value={formatCurrency(data.ticketMedio)}
            icon={Users}
            iconColor="text-indigo-600"
          />
        </div>

        {/* Gráficos Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos por Dia</CardTitle>
              <CardDescription>
                Evolução dos pedidos nos últimos {periodo} dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p>Gráfico de pedidos por dia</p>
                  <p className="text-sm">(Implementação futura)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receita por Empresa</CardTitle>
              <CardDescription>
                Top empresas por receita nos últimos {periodo} dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-2" />
                  <p>Gráfico de receita por empresa</p>
                  <p className="text-sm">(Implementação futura)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Executivo */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Executivo</CardTitle>
            <CardDescription>
              Principais insights dos últimos {periodo} dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Crescimento Positivo</p>
                  <p className="text-sm text-gray-600">
                    O sistema apresentou crescimento de {data.crescimentoMensal}% no número de pedidos em relação ao período anterior.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Ticket Médio Estável</p>
                  <p className="text-sm text-gray-600">
                    O ticket médio de {formatCurrency(data.ticketMedio)} se mantém estável, indicando consistência no valor dos pedidos.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Base de Empresas Ativa</p>
                  <p className="text-sm text-gray-600">
                    {data.empresasAtivas} empresas ativas no sistema, com boa distribuição de pedidos entre elas.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  )
}