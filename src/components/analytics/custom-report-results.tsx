'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Download, RefreshCw } from 'lucide-react'
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

interface CustomReportResultsProps {
  results: any
  isLoading: boolean
  onRefresh: () => void
  onExport: (format: 'csv' | 'pdf') => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function CustomReportResults({ 
  results, 
  isLoading, 
  onRefresh, 
  onExport 
}: CustomReportResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!results || !results.data || results.data.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon="📊"
            title="Nenhum resultado encontrado"
            description="Execute um relatório para ver os resultados aqui."
          />
        </CardContent>
      </Card>
    )
  }

  const { data, config, executedAt, recordCount } = results
  const hasGrouping = config.groupBy && data.length > 0 && typeof data[0] === 'object' && 'group' in data[0]

  return (
    <div className="space-y-6">
      {/* Header com informações do relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{config.name}</CardTitle>
              <CardDescription>
                {config.description && (
                  <span className="block mb-2">{config.description}</span>
                )}
                <span className="text-sm text-muted-foreground">
                  Executado em: {new Date(executedAt).toLocaleString('pt-BR')} • 
                  {recordCount} registros processados
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={() => onExport('csv')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => onExport('pdf')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros aplicados */}
      {config.filters && config.filters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtros Aplicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {config.filters.map((filter: any, index: number) => (
                <Badge key={index} variant="outline">
                  {filter.field} {filter.operator} {filter.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {hasGrouping ? (
        <GroupedResults data={data} config={config} />
      ) : (
        <SimpleResults data={data} config={config} />
      )}
    </div>
  )
}

function SimpleResults({ data, config }: { data: any[], config: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {typeof item.value === 'number' 
                      ? item.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: item.value % 1 !== 0 ? 2 : 0,
                          maximumFractionDigits: 2
                        })
                      : item.value
                    }
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.metric}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function GroupedResults({ data, config }: { data: any[], config: any }) {
  const metrics = config.metrics || []
  const hasNumericMetrics = metrics.some((m: any) => 
    ['sum', 'avg', 'count'].includes(m.aggregation)
  )

  return (
    <div className="space-y-6">
      {/* Gráfico */}
      {hasNumericMetrics && data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              {data.length <= 10 ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="group" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  {metrics.map((metric: any, index: number) => (
                    <Bar 
                      key={metric.name}
                      dataKey={metric.name} 
                      fill={COLORS[index % COLORS.length]}
                      name={metric.name}
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  {metrics.map((metric: any, index: number) => (
                    <Line 
                      key={metric.name}
                      type="monotone" 
                      dataKey={metric.name} 
                      stroke={COLORS[index % COLORS.length]}
                      name={metric.name}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabela de dados */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                {metrics.map((metric: any) => (
                  <TableHead key={metric.name}>{metric.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.group}</TableCell>
                  {metrics.map((metric: any) => (
                    <TableCell key={metric.name}>
                      {typeof row[metric.name] === 'number' 
                        ? row[metric.name].toLocaleString('pt-BR', {
                            minimumFractionDigits: row[metric.name] % 1 !== 0 ? 2 : 0,
                            maximumFractionDigits: 2
                          })
                        : row[metric.name] || '-'
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumo estatístico */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.length}</div>
              <p className="text-sm text-muted-foreground">Grupos</p>
            </div>
            
            {metrics.map((metric: any) => {
              const values = data.map(d => d[metric.name]).filter(v => typeof v === 'number')
              if (values.length === 0) return null
              
              const total = values.reduce((sum, val) => sum + val, 0)
              const avg = total / values.length
              
              return (
                <div key={metric.name} className="text-center">
                  <div className="text-2xl font-bold">
                    {metric.aggregation === 'avg' 
                      ? avg.toFixed(2)
                      : total.toLocaleString('pt-BR')
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {metric.aggregation === 'avg' ? 'Média' : 'Total'} - {metric.name}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}