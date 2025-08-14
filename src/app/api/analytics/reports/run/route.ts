import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const reportConfig = await request.json()
    
    // Executar o relatório baseado na configuração
    const results = await executeCustomReport(supabase, user.id, reportConfig)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Erro ao executar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

async function executeCustomReport(supabase: any, userId: string, config: any) {
  const { filters, metrics, groupBy, dateRange, userType } = config

  // Calcular período baseado no dateRange
  const endDate = new Date()
  const startDate = new Date()
  
  switch (dateRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  // Construir query baseada no tipo de usuário
  let baseQuery = buildBaseQuery(supabase, userType, userId)
  
  // Aplicar filtros de data
  baseQuery = baseQuery
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Aplicar filtros personalizados
  baseQuery = applyFilters(baseQuery, filters)

  // Executar query
  const { data, error } = await baseQuery

  if (error) throw error

  // Processar dados baseado nas métricas
  const processedData = processMetrics(data, metrics, groupBy)

  return {
    data: processedData,
    config,
    executedAt: new Date().toISOString(),
    recordCount: data?.length || 0
  }
}

function buildBaseQuery(supabase: any, userType: string, userId: string) {
  switch (userType) {
    case 'empresa':
      return supabase
        .from('pedidos')
        .select(`
          *,
          produtos:pedido_items(produtos(*)),
          ratings(rating),
          empresas!inner(user_id)
        `)
        .eq('empresas.user_id', userId)

    case 'entregador':
      return supabase
        .from('pedidos')
        .select(`
          *,
          ratings(rating),
          delivery_tracking(*),
          entregadores!inner(user_id)
        `)
        .eq('entregadores.user_id', userId)

    case 'consumidor':
      return supabase
        .from('pedidos')
        .select(`
          *,
          empresas(nome),
          produtos:pedido_items(produtos(*)),
          consumidores!inner(user_id)
        `)
        .eq('consumidores.user_id', userId)

    case 'admin':
      return supabase
        .from('pedidos')
        .select(`
          *,
          empresas(nome, created_at),
          entregadores(nome),
          consumidores(nome),
          user_roles(role)
        `)

    default:
      throw new Error('Tipo de usuário inválido')
  }
}

function applyFilters(query: any, filters: any[]) {
  filters.forEach(filter => {
    if (!filter.field || !filter.value) return

    const [table, field] = filter.field.split('.')
    
    switch (filter.operator) {
      case 'equals':
        query = query.eq(filter.field, filter.value)
        break
      case 'not_equals':
        query = query.neq(filter.field, filter.value)
        break
      case 'greater_than':
        query = query.gt(filter.field, parseFloat(filter.value) || filter.value)
        break
      case 'less_than':
        query = query.lt(filter.field, parseFloat(filter.value) || filter.value)
        break
      case 'contains':
        query = query.ilike(filter.field, `%${filter.value}%`)
        break
      case 'between':
        const [min, max] = filter.value.split(',')
        if (min && max) {
          query = query.gte(filter.field, min.trim()).lte(filter.field, max.trim())
        }
        break
    }
  })

  return query
}

function processMetrics(data: any[], metrics: any[], groupBy?: string) {
  if (!data || data.length === 0) {
    return []
  }

  // Se não há agrupamento, calcular métricas globais
  if (!groupBy) {
    return metrics.map(metric => ({
      metric: metric.name,
      value: calculateMetric(data, metric)
    }))
  }

  // Agrupar dados
  const grouped = data.reduce((acc, item) => {
    const groupValue = getNestedValue(item, groupBy) || 'Não informado'
    if (!acc[groupValue]) {
      acc[groupValue] = []
    }
    acc[groupValue].push(item)
    return acc
  }, {} as Record<string, any[]>)

  // Calcular métricas para cada grupo
  return Object.entries(grouped).map(([group, groupData]) => {
    const result: any = { group }
    
    metrics.forEach(metric => {
      result[metric.name] = calculateMetric(groupData as any[], metric)
    })
    
    return result
  })
}

function calculateMetric(data: any[], metric: any) {
  const values = data
    .map(item => getNestedValue(item, metric.field))
    .filter(value => value !== null && value !== undefined)

  if (values.length === 0) return 0

  switch (metric.aggregation) {
    case 'count':
      return values.length
    case 'sum':
      return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    case 'avg':
      const sum = values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
      return sum / values.length
    case 'min':
      return Math.min(...values.map(val => parseFloat(val) || 0))
    case 'max':
      return Math.max(...values.map(val => parseFloat(val) || 0))
    default:
      return 0
  }
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return current[key]
    }
    return null
  }, obj)
}