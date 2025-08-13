'use client'

import { useState } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/ui/stat-card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface AnalyticsDashboardProps {
  userType: 'empresa' | 'entregador' | 'consumidor' | 'admin'
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AnalyticsDashboard({ userType, className }: AnalyticsDashboardProps) {
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d')
  const { data, isLoading, error, kpis, chartData, refetch, exportData } = useAnalytics(periodo)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Erro ao carregar analytics"
        description={error}
        action={{
          label: "Tentar novamente",
          onClick: refetch
        }}
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        icon="📊"
        title="Nenhum dado disponível"
        description="Não há dados de analytics para exibir no momento."
      />
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Acompanhe suas métricas e performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={(value: '7d' | '30d' | '90d') => setPeriodo(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => exportData('csv')}
            size="sm"
          >
            Exportar CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={() => exportData('pdf')}
            size="sm"
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Vendas/Ganhos por Dia */}
            {chartData?.vendas && chartData.vendas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {userType === 'entregador' ? 'Ganhos por Dia' : 'Vendas por Dia'}
                  </CardTitle>
                  <CardDescription>
                    Evolução {userType === 'entregador' ? 'dos ganhos' : 'das vendas'} no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.vendas}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, userType === 'entregador' ? 'Ganhos' : 'Vendas']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="vendas" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ fill: '#8884d8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Gráfico de Status dos Pedidos */}
            {chartData?.status && chartData.status.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Pedidos</CardTitle>
                  <CardDescription>
                    Distribuição dos pedidos por status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.status}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentual }) => `${status}: ${percentual.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {chartData.status.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Produtos (apenas para empresas) */}
          {userType === 'empresa' && chartData?.produtos && chartData.produtos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Produtos</CardTitle>
                <CardDescription>
                  Produtos mais vendidos no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.produtos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vendas" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Crescimento */}
            <Card>
              <CardHeader>
                <CardTitle>Crescimento</CardTitle>
                <CardDescription>
                  Comparação com período anterior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Crescimento Mensal</span>
                  <Badge variant={data.crescimentoMensal > 0 ? 'default' : 'destructive'}>
                    {data.crescimentoMensal > 0 ? '+' : ''}{data.crescimentoMensal}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total de Pedidos</span>
                  <span className="text-sm text-muted-foreground">{data.totalPedidos}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {userType === 'entregador' ? 'Total de Ganhos' : 'Total de Vendas'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    R$ {data.totalVendas.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ticket Médio</span>
                  <span className="text-sm text-muted-foreground">
                    R$ {data.ticketMedio.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Comparação Semanal vs Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação de Períodos</CardTitle>
                <CardDescription>
                  Semana atual vs mês atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Esta Semana</span>
                      <span className="text-sm text-muted-foreground">
                        {data.pedidosSemana} pedidos
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${data.pedidosMes > 0 ? (data.pedidosSemana / data.pedidosMes) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Este Mês</span>
                      <span className="text-sm text-muted-foreground">
                        {data.pedidosMes} pedidos
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Métricas Específicas por Tipo de Usuário */}
          {userType === 'empresa' && data.empresaMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.empresaMetrics.produtosMaisPedidos.map((produto, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{produto.nome}</span>
                        <Badge variant="outline">{produto.quantidade} pedidos</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horários Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.empresaMetrics.horariosPopulares.map((horario, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{horario.hora}:00</span>
                        <Badge variant="outline">{horario.pedidos} pedidos</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {userType === 'entregador' && data.entregadorMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance de Entregas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Entregas Realizadas</span>
                    <span className="text-sm text-muted-foreground">
                      {data.entregadorMetrics.entregasRealizadas}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tempo Médio</span>
                    <span className="text-sm text-muted-foreground">
                      {data.entregadorMetrics.tempoMedioEntrega} min
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Distância Percorrida</span>
                    <span className="text-sm text-muted-foreground">
                      {data.entregadorMetrics.distanciaPercorrida.toFixed(1)} km
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avaliação</span>
                    <Badge variant="outline">
                      ⭐ {data.entregadorMetrics.avaliacaoEntregador.toFixed(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Ganhos Diários */}
              {data.entregadorMetrics.ganhosDiarios.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ganhos Diários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.entregadorMetrics.ganhosDiarios.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="data" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Ganhos']}
                          labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        />
                        <Bar dataKey="valor" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {userType === 'consumidor' && data.consumidorMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Seus Hábitos de Consumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pedidos Realizados</span>
                  <span className="text-sm text-muted-foreground">
                    {data.consumidorMetrics.pedidosRealizados}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gasto Total</span>
                  <span className="text-sm text-muted-foreground">
                    R$ {data.consumidorMetrics.gastoTotal.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Restaurante Favorito</span>
                  <span className="text-sm text-muted-foreground">
                    {data.consumidorMetrics.restauranteFavorito}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Categoria Preferida</span>
                  <span className="text-sm text-muted-foreground">
                    {data.consumidorMetrics.categoriaPreferida}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Economia com Promoções</span>
                  <Badge variant="outline" className="text-green-600">
                    R$ {data.consumidorMetrics.economiaComPromocoes.toFixed(2)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {userType === 'admin' && data.adminMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas da Plataforma</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Usuários Ativos</span>
                    <span className="text-sm text-muted-foreground">
                      {data.adminMetrics.usuariosAtivos}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Novas Empresas</span>
                    <span className="text-sm text-muted-foreground">
                      {data.adminMetrics.novasEmpresas}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Novos Entregadores</span>
                    <span className="text-sm text-muted-foreground">
                      {data.adminMetrics.novosEntregadores}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Conversão</span>
                    <Badge variant="outline">
                      {data.adminMetrics.taxaConversao}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Receita da Plataforma</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      R$ {data.adminMetrics.receitaPlataforma.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Receita total no período selecionado
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}