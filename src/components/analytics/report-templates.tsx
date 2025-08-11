'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Star } from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  userTypes: string[]
  config: any
  popular?: boolean
}

interface ReportTemplatesProps {
  userType: 'empresa' | 'entregador' | 'consumidor' | 'admin'
  onUseTemplate: (template: ReportTemplate) => void
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  // Templates para Empresas
  {
    id: 'vendas-por-categoria',
    name: 'Vendas por Categoria',
    description: 'Analise quais categorias de produtos vendem mais no seu restaurante',
    category: 'Vendas',
    userTypes: ['empresa'],
    popular: true,
    config: {
      name: 'Vendas por Categoria',
      description: 'Relatório de vendas agrupado por categoria de produto',
      metrics: [
        {
          id: '1',
          name: 'Total de Vendas',
          field: 'pedidos.valor_total',
          aggregation: 'sum'
        },
        {
          id: '2',
          name: 'Quantidade de Pedidos',
          field: 'pedidos.id',
          aggregation: 'count'
        }
      ],
      groupBy: 'produtos.categoria',
      filters: [
        {
          id: '1',
          field: 'pedidos.status',
          operator: 'equals',
          value: 'entregue'
        }
      ],
      dateRange: '30d',
      userType: 'empresa'
    }
  },
  {
    id: 'performance-horarios',
    name: 'Performance por Horários',
    description: 'Descubra os melhores horários para o seu negócio',
    category: 'Performance',
    userTypes: ['empresa'],
    config: {
      name: 'Performance por Horários',
      description: 'Análise de pedidos e vendas por horário do dia',
      metrics: [
        {
          id: '1',
          name: 'Pedidos',
          field: 'pedidos.id',
          aggregation: 'count'
        },
        {
          id: '2',
          name: 'Receita',
          field: 'pedidos.valor_total',
          aggregation: 'sum'
        }
      ],
      groupBy: 'pedidos.created_at',
      filters: [],
      dateRange: '30d',
      userType: 'empresa'
    }
  },
  {
    id: 'avaliacoes-vendas',
    name: 'Avaliações vs Vendas',
    description: 'Correlacione suas avaliações com o volume de vendas',
    category: 'Qualidade',
    userTypes: ['empresa'],
    config: {
      name: 'Avaliações vs Vendas',
      description: 'Análise da relação entre avaliações e performance de vendas',
      metrics: [
        {
          id: '1',
          name: 'Avaliação Média',
          field: 'ratings.rating',
          aggregation: 'avg'
        },
        {
          id: '2',
          name: 'Total de Vendas',
          field: 'pedidos.valor_total',
          aggregation: 'sum'
        }
      ],
      groupBy: 'pedidos.created_at',
      filters: [
        {
          id: '1',
          field: 'ratings.rating',
          operator: 'greater_than',
          value: '0'
        }
      ],
      dateRange: '30d',
      userType: 'empresa'
    }
  },

  // Templates para Entregadores
  {
    id: 'ganhos-diarios',
    name: 'Ganhos Diários',
    description: 'Acompanhe seus ganhos dia a dia',
    category: 'Financeiro',
    userTypes: ['entregador'],
    popular: true,
    config: {
      name: 'Ganhos Diários',
      description: 'Relatório de ganhos agrupado por dia',
      metrics: [
        {
          id: '1',
          name: 'Total de Ganhos',
          field: 'pedidos.taxa_entrega',
          aggregation: 'sum'
        },
        {
          id: '2',
          name: 'Entregas Realizadas',
          field: 'pedidos.id',
          aggregation: 'count'
        }
      ],
      groupBy: 'pedidos.created_at',
      filters: [
        {
          id: '1',
          field: 'pedidos.status',
          operator: 'equals',
          value: 'entregue'
        }
      ],
      dateRange: '30d',
      userType: 'entregador'
    }
  },
  {
    id: 'performance-entregador',
    name: 'Performance de Entregas',
    description: 'Analise sua eficiência e avaliações',
    category: 'Performance',
    userTypes: ['entregador'],
    config: {
      name: 'Performance de Entregas',
      description: 'Métricas de performance e qualidade das entregas',
      metrics: [
        {
          id: '1',
          name: 'Entregas Concluídas',
          field: 'pedidos.id',
          aggregation: 'count'
        },
        {
          id: '2',
          name: 'Avaliação Média',
          field: 'ratings.rating',
          aggregation: 'avg'
        },
        {
          id: '3',
          name: 'Distância Total',
          field: 'delivery_tracking.distance',
          aggregation: 'sum'
        }
      ],
      groupBy: 'pedidos.created_at',
      filters: [
        {
          id: '1',
          field: 'pedidos.status',
          operator: 'equals',
          value: 'entregue'
        }
      ],
      dateRange: '30d',
      userType: 'entregador'
    }
  },

  // Templates para Consumidores
  {
    id: 'gastos-mensais',
    name: 'Gastos Mensais',
    description: 'Acompanhe seus gastos com delivery',
    category: 'Financeiro',
    userTypes: ['consumidor'],
    popular: true,
    config: {
      name: 'Gastos Mensais',
      description: 'Análise dos gastos mensais com pedidos',
      metrics: [
        {
          id: '1',
          name: 'Total Gasto',
          field: 'pedidos.valor_total',
          aggregation: 'sum'
        },
        {
          id: '2',
          name: 'Número de Pedidos',
          field: 'pedidos.id',
          aggregation: 'count'
        }
      ],
      groupBy: 'pedidos.created_at',
      filters: [],
      dateRange: '90d',
      userType: 'consumidor'
    }
  },
  {
    id: 'restaurantes-favoritos',
    name: 'Restaurantes Favoritos',
    description: 'Veja onde você mais pede comida',
    category: 'Hábitos',
    userTypes: ['consumidor'],
    config: {
      name: 'Restaurantes Favoritos',
      description: 'Ranking dos restaurantes mais pedidos',
      metrics: [
        {
          id: '1',
          name: 'Pedidos',
          field: 'pedidos.id',
          aggregation: 'count'
        },
        {
          id: '2',
          name: 'Valor Gasto',
          field: 'pedidos.valor_total',
          aggregation: 'sum'
        }
      ],
      groupBy: 'empresas.nome',
      filters: [],
      dateRange: '90d',
      userType: 'consumidor'
    }
  },

  // Templates para Admin
  {
    id: 'overview-plataforma',
    name: 'Overview da Plataforma',
    description: 'Visão geral de todas as métricas da plataforma',
    category: 'Geral',
    userTypes: ['admin'],
    popular: true,
    config: {
      name: 'Overview da Plataforma',
      description: 'Métricas gerais de performance da plataforma',
      metrics: [
        {
          id: '1',
          name: 'Total de Pedidos',
          field: 'pedidos.id',
          aggregation: 'count'
        },
        {
          id: '2',
          name: 'Receita Total',
          field: 'pedidos.valor_total',
          aggregation: 'sum'
        },
        {
          id: '3',
          name: 'Ticket Médio',
          field: 'pedidos.valor_total',
          aggregation: 'avg'
        }
      ],
      groupBy: 'pedidos.created_at',
      filters: [
        {
          id: '1',
          field: 'pedidos.status',
          operator: 'equals',
          value: 'entregue'
        }
      ],
      dateRange: '30d',
      userType: 'admin'
    }
  },
  {
    id: 'crescimento-usuarios',
    name: 'Crescimento de Usuários',
    description: 'Acompanhe o crescimento da base de usuários',
    category: 'Crescimento',
    userTypes: ['admin'],
    config: {
      name: 'Crescimento de Usuários',
      description: 'Análise do crescimento por tipo de usuário',
      metrics: [
        {
          id: '1',
          name: 'Novos Usuários',
          field: 'user_roles.user_id',
          aggregation: 'count'
        }
      ],
      groupBy: 'user_roles.role',
      filters: [],
      dateRange: '90d',
      userType: 'admin'
    }
  }
]

export function ReportTemplates({ userType, onUseTemplate }: ReportTemplatesProps) {
  const availableTemplates = REPORT_TEMPLATES.filter(template => 
    template.userTypes.includes(userType)
  )

  const categories = [...new Set(availableTemplates.map(t => t.category))]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Templates Prontos</h3>
        <p className="text-sm text-muted-foreground">
          Use um template pronto e personalize conforme necessário
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h4 className="font-medium text-primary">{category}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTemplates
              .filter(template => template.category === category)
              .map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      {template.name}
                      {template.popular && (
                        <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {template.config.metrics?.length || 0} métricas
                      </Badge>
                      {template.config.groupBy && (
                        <Badge variant="outline">Agrupado</Badge>
                      )}
                      {template.config.filters?.length > 0 && (
                        <Badge variant="outline">
                          {template.config.filters.length} filtros
                        </Badge>
                      )}
                    </div>

                    <Button 
                      onClick={() => onUseTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Usar Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {availableTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum template disponível para este tipo de usuário.</p>
        </div>
      )}
    </div>
  )
}