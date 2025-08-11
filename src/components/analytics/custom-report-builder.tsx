'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X, Save, Play, Template } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ReportTemplates } from './report-templates'

interface ReportFilter {
  id: string
  field: string
  operator: string
  value: string
}

interface ReportMetric {
  id: string
  name: string
  field: string
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max'
}

interface CustomReportBuilderProps {
  userType: 'empresa' | 'entregador' | 'consumidor' | 'admin'
  onSave?: (report: any) => void
  onRun?: (report: any) => void
}

const AVAILABLE_FIELDS = {
  empresa: [
    { value: 'pedidos.created_at', label: 'Data do Pedido' },
    { value: 'pedidos.status', label: 'Status do Pedido' },
    { value: 'pedidos.valor_total', label: 'Valor Total' },
    { value: 'produtos.categoria', label: 'Categoria do Produto' },
    { value: 'ratings.rating', label: 'Avaliação' },
  ],
  entregador: [
    { value: 'pedidos.created_at', label: 'Data da Entrega' },
    { value: 'pedidos.status', label: 'Status da Entrega' },
    { value: 'pedidos.taxa_entrega', label: 'Taxa de Entrega' },
    { value: 'delivery_tracking.distance', label: 'Distância' },
    { value: 'ratings.rating', label: 'Avaliação' },
  ],
  consumidor: [
    { value: 'pedidos.created_at', label: 'Data do Pedido' },
    { value: 'pedidos.valor_total', label: 'Valor Gasto' },
    { value: 'empresas.nome', label: 'Restaurante' },
    { value: 'produtos.categoria', label: 'Categoria' },
  ],
  admin: [
    { value: 'pedidos.created_at', label: 'Data do Pedido' },
    { value: 'pedidos.status', label: 'Status' },
    { value: 'pedidos.valor_total', label: 'Valor Total' },
    { value: 'user_roles.role', label: 'Tipo de Usuário' },
    { value: 'empresas.created_at', label: 'Data Cadastro Empresa' },
  ]
}

const OPERATORS = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'contains', label: 'Contém' },
  { value: 'between', label: 'Entre' },
]

const AGGREGATIONS = [
  { value: 'count', label: 'Contar' },
  { value: 'sum', label: 'Somar' },
  { value: 'avg', label: 'Média' },
  { value: 'min', label: 'Mínimo' },
  { value: 'max', label: 'Máximo' },
]

export function CustomReportBuilder({ userType, onSave, onRun }: CustomReportBuilderProps) {
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [filters, setFilters] = useState<ReportFilter[]>([])
  const [metrics, setMetrics] = useState<ReportMetric[]>([])
  const [groupBy, setGroupBy] = useState('')
  const [dateRange, setDateRange] = useState('30d')
  const { toast } = useToast()

  const availableFields = AVAILABLE_FIELDS[userType] || []

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const updateFilter = (id: string, field: keyof ReportFilter, value: string) => {
    setFilters(filters.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  const addMetric = () => {
    const newMetric: ReportMetric = {
      id: Date.now().toString(),
      name: '',
      field: '',
      aggregation: 'count'
    }
    setMetrics([...metrics, newMetric])
  }

  const removeMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id))
  }

  const updateMetric = (id: string, field: keyof ReportMetric, value: string) => {
    setMetrics(metrics.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const handleSave = async () => {
    if (!reportName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, insira um nome para o relatório.',
        variant: 'destructive'
      })
      return
    }

    if (metrics.length === 0) {
      toast({
        title: 'Métricas obrigatórias',
        description: 'Adicione pelo menos uma métrica ao relatório.',
        variant: 'destructive'
      })
      return
    }

    const reportConfig = {
      name: reportName,
      description: reportDescription,
      filters,
      metrics,
      groupBy,
      dateRange,
      userType
    }

    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportConfig)
      })

      if (!response.ok) throw new Error('Erro ao salvar relatório')

      toast({
        title: 'Relatório salvo',
        description: 'Seu relatório personalizado foi salvo com sucesso.'
      })

      onSave?.(reportConfig)
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o relatório.',
        variant: 'destructive'
      })
    }
  }

  const handleRun = () => {
    if (metrics.length === 0) {
      toast({
        title: 'Métricas obrigatórias',
        description: 'Adicione pelo menos uma métrica para executar o relatório.',
        variant: 'destructive'
      })
      return
    }

    const reportConfig = {
      name: reportName || 'Relatório Temporário',
      description: reportDescription,
      filters,
      metrics,
      groupBy,
      dateRange,
      userType
    }

    onRun?.(reportConfig)
  }

  const loadTemplate = (template: any) => {
    const config = template.config
    setReportName(config.name)
    setReportDescription(config.description || '')
    setFilters(config.filters || [])
    setMetrics(config.metrics || [])
    setGroupBy(config.groupBy || '')
    setDateRange(config.dateRange || '30d')
    
    toast({
      title: 'Template carregado',
      description: 'O template foi carregado. Você pode personalizá-lo antes de salvar.'
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">
            <Template className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="builder">
            <Plus className="h-4 w-4 mr-2" />
            Construtor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <ReportTemplates userType={userType} onUseTemplate={loadTemplate} />
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Construtor de Relatórios</CardTitle>
              <CardDescription>
                Crie relatórios personalizados com suas métricas específicas
              </CardDescription>
            </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportName">Nome do Relatório</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Ex: Vendas por Categoria"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="1y">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportDescription">Descrição (opcional)</Label>
            <Textarea
              id="reportDescription"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Descreva o objetivo deste relatório..."
              rows={3}
            />
          </div>

          <Separator />

          {/* Métricas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Métricas</h3>
              <Button onClick={addMetric} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Métrica
              </Button>
            </div>

            {metrics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma métrica adicionada. Clique em "Adicionar Métrica" para começar.
              </div>
            )}

            {metrics.map((metric) => (
              <Card key={metric.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Nome da Métrica</Label>
                    <Input
                      value={metric.name}
                      onChange={(e) => updateMetric(metric.id, 'name', e.target.value)}
                      placeholder="Ex: Total de Vendas"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Campo</Label>
                    <Select 
                      value={metric.field} 
                      onValueChange={(value) => updateMetric(metric.id, 'field', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Agregação</Label>
                    <Select 
                      value={metric.aggregation} 
                      onValueChange={(value: any) => updateMetric(metric.id, 'aggregation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AGGREGATIONS.map((agg) => (
                          <SelectItem key={agg.value} value={agg.value}>
                            {agg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    onClick={() => removeMetric(metric.id)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Filtros */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Filtros</h3>
              <Button onClick={addFilter} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Filtro
              </Button>
            </div>

            {filters.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nenhum filtro adicionado. Os filtros são opcionais.
              </div>
            )}

            {filters.map((filter) => (
              <Card key={filter.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Campo</Label>
                    <Select 
                      value={filter.field} 
                      onValueChange={(value) => updateFilter(filter.id, 'field', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Operador</Label>
                    <Select 
                      value={filter.operator} 
                      onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                      placeholder="Digite o valor"
                    />
                  </div>
                  
                  <Button
                    onClick={() => removeFilter(filter.id)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Agrupamento */}
          <div className="space-y-2">
            <Label>Agrupar por (opcional)</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um campo para agrupar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem agrupamento</SelectItem>
                {availableFields.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={handleRun} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Executar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Relatório
            </Button>
          </div>
        </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}