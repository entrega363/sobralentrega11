import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const periodo = searchParams.get('periodo') || '30d'
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType')

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
    }

    // Calcular datas baseado no período
    const now = new Date()
    const startDate = new Date()
    
    switch (periodo) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
    }

    // Buscar dados baseado no tipo de usuário
    let analyticsData = {}

    if (userType === 'empresa') {
      analyticsData = await getEmpresaAnalytics(supabase, userId, startDate, now)
    } else if (userType === 'entregador') {
      analyticsData = await getEntregadorAnalytics(supabase, userId, startDate, now)
    } else if (userType === 'consumidor') {
      analyticsData = await getConsumidorAnalytics(supabase, userId, startDate, now)
    } else if (userType === 'admin') {
      analyticsData = await getAdminAnalytics(supabase, startDate, now)
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Erro ao buscar analytics:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

async function getEmpresaAnalytics(supabase: any, userId: string, startDate: Date, endDate: Date) {
  // Buscar empresa do usuário
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!empresa) throw new Error('Empresa não encontrada')

  // Métricas gerais
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*')
    .eq('empresa_id', empresa.id)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const totalPedidos = pedidos?.length || 0
  const pedidosEntregues = pedidos?.filter((p: any) => p.status === 'entregue') || []
  const totalVendas = pedidosEntregues.reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0)
  const ticketMedio = pedidosEntregues.length > 0 ? totalVendas / pedidosEntregues.length : 0

  // Pedidos por dia
  const vendasPorDia = await getVendasPorDia(supabase, empresa.id, startDate, endDate)
  
  // Status dos pedidos
  const pedidosPorStatus = await getPedidosPorStatus(supabase, empresa.id, startDate, endDate)
  
  // Top produtos
  const topProdutos = await getTopProdutos(supabase, empresa.id, startDate, endDate)
  
  // Avaliação média
  const { data: avaliacoes } = await supabase
    .from('ratings')
    .select('rating')
    .eq('empresa_id', empresa.id)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const avaliacaoMedia = avaliacoes?.length > 0 
    ? avaliacoes.reduce((sum: number, a: any) => sum + a.rating, 0) / avaliacoes.length 
    : 0

  // Métricas específicas da empresa
  const empresaMetrics = await getEmpresaSpecificMetrics(supabase, empresa.id, startDate, endDate)

  return {
    totalPedidos,
    totalVendas,
    ticketMedio,
    crescimentoMensal: 12, // Calcular baseado em dados históricos
    pedidosHoje: pedidos?.filter((p: any) => isToday(new Date(p.created_at))).length || 0,
    vendasHoje: pedidos?.filter((p: any) => isToday(new Date(p.created_at)) && p.status === 'entregue')
      .reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0) || 0,
    pedidosSemana: pedidos?.filter((p: any) => isThisWeek(new Date(p.created_at))).length || 0,
    vendasSemana: pedidos?.filter((p: any) => isThisWeek(new Date(p.created_at)) && p.status === 'entregue')
      .reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0) || 0,
    pedidosMes: totalPedidos,
    vendasMes: totalVendas,
    vendasPorDia,
    pedidosPorStatus,
    topProdutos,
    avaliacaoMedia,
    empresaMetrics
  }
}

async function getEntregadorAnalytics(supabase: any, userId: string, startDate: Date, endDate: Date) {
  // Buscar entregador do usuário
  const { data: entregador } = await supabase
    .from('entregadores')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!entregador) throw new Error('Entregador não encontrado')

  // Entregas realizadas
  const { data: entregas } = await supabase
    .from('pedidos')
    .select('*')
    .eq('entregador_id', entregador.id)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const entregasRealizadas = entregas?.filter((e: any) => e.status === 'entregue').length || 0
  const totalGanhos = entregas?.filter((e: any) => e.status === 'entregue')
    .reduce((sum: number, e: any) => sum + (e.taxa_entrega || 0), 0) || 0

  // Tempo médio de entrega (simulado)
  const tempoMedioEntrega = 25

  // Avaliação do entregador
  const { data: avaliacoes } = await supabase
    .from('ratings')
    .select('rating')
    .eq('entregador_id', entregador.id)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const avaliacaoEntregador = avaliacoes?.length > 0 
    ? avaliacoes.reduce((sum: number, a: any) => sum + a.rating, 0) / avaliacoes.length 
    : 0

  // Ganhos por dia
  const ganhosDiarios = await getGanhosPorDia(supabase, entregador.id, startDate, endDate)

  return {
    totalPedidos: entregas?.length || 0,
    totalVendas: totalGanhos,
    ticketMedio: entregasRealizadas > 0 ? totalGanhos / entregasRealizadas : 0,
    crescimentoMensal: 8,
    pedidosHoje: entregas?.filter((e: any) => isToday(new Date(e.created_at))).length || 0,
    vendasHoje: entregas?.filter((e: any) => isToday(new Date(e.created_at)) && e.status === 'entregue')
      .reduce((sum: number, e: any) => sum + (e.taxa_entrega || 0), 0) || 0,
    pedidosSemana: entregas?.filter((e: any) => isThisWeek(new Date(e.created_at))).length || 0,
    vendasSemana: entregas?.filter((e: any) => isThisWeek(new Date(e.created_at)) && e.status === 'entregue')
      .reduce((sum: number, e: any) => sum + (e.taxa_entrega || 0), 0) || 0,
    pedidosMes: entregas?.length || 0,
    vendasMes: totalGanhos,
    vendasPorDia: ganhosDiarios,
    pedidosPorStatus: [],
    topProdutos: [],
    avaliacaoMedia: avaliacaoEntregador,
    entregadorMetrics: {
      entregasRealizadas,
      tempoMedioEntrega,
      distanciaPercorrida: entregasRealizadas * 5.2, // Simulado
      avaliacaoEntregador,
      ganhosDiarios
    }
  }
}

async function getConsumidorAnalytics(supabase: any, userId: string, startDate: Date, endDate: Date) {
  // Buscar consumidor do usuário
  const { data: consumidor } = await supabase
    .from('consumidores')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!consumidor) throw new Error('Consumidor não encontrado')

  // Pedidos realizados
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*, empresas(nome)')
    .eq('consumidor_id', consumidor.id)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const pedidosRealizados = pedidos?.length || 0
  const gastoTotal = pedidos?.reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0) || 0

  // Restaurante favorito
  const empresaFrequency = pedidos?.reduce((acc: any, p: any) => {
    const nome = p.empresas?.nome || 'Desconhecido'
    acc[nome] = (acc[nome] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const restauranteFavorito = Object.keys(empresaFrequency).length > 0
    ? Object.keys(empresaFrequency).reduce((a, b) => empresaFrequency[a] > empresaFrequency[b] ? a : b)
    : 'N/A'

  return {
    totalPedidos: pedidosRealizados,
    totalVendas: gastoTotal,
    ticketMedio: pedidosRealizados > 0 ? gastoTotal / pedidosRealizados : 0,
    crescimentoMensal: 5,
    pedidosHoje: pedidos?.filter((p: any) => isToday(new Date(p.created_at))).length || 0,
    vendasHoje: pedidos?.filter((p: any) => isToday(new Date(p.created_at)))
      .reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0) || 0,
    pedidosSemana: pedidos?.filter((p: any) => isThisWeek(new Date(p.created_at))).length || 0,
    vendasSemana: pedidos?.filter((p: any) => isThisWeek(new Date(p.created_at)))
      .reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0) || 0,
    pedidosMes: pedidosRealizados,
    vendasMes: gastoTotal,
    vendasPorDia: [],
    pedidosPorStatus: [],
    topProdutos: [],
    avaliacaoMedia: 0,
    consumidorMetrics: {
      pedidosRealizados,
      gastoTotal,
      restauranteFavorito,
      categoriaPreferida: 'Lanches', // Simulado
      economiaComPromocoes: gastoTotal * 0.1 // Simulado
    }
  }
}

async function getAdminAnalytics(supabase: any, startDate: Date, endDate: Date) {
  // Usuários ativos
  const { data: usuarios } = await supabase
    .from('user_roles')
    .select('user_id')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Novas empresas
  const { data: empresas } = await supabase
    .from('empresas')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Novos entregadores
  const { data: entregadores } = await supabase
    .from('entregadores')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Receita total da plataforma
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('valor_total, taxa_plataforma')
    .eq('status', 'entregue')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const receitaPlataforma = pedidos?.reduce((sum: number, p: any) => sum + (p.taxa_plataforma || 0), 0) || 0

  return {
    totalPedidos: pedidos?.length || 0,
    totalVendas: pedidos?.reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0) || 0,
    ticketMedio: 0,
    crescimentoMensal: 15,
    pedidosHoje: 0,
    vendasHoje: 0,
    pedidosSemana: 0,
    vendasSemana: 0,
    pedidosMes: pedidos?.length || 0,
    vendasMes: pedidos?.reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0) || 0,
    vendasPorDia: [],
    pedidosPorStatus: [],
    topProdutos: [],
    avaliacaoMedia: 0,
    adminMetrics: {
      usuariosAtivos: usuarios?.length || 0,
      novasEmpresas: empresas?.length || 0,
      novosEntregadores: entregadores?.length || 0,
      taxaConversao: 12.5, // Simulado
      receitaPlataforma
    }
  }
}

// Funções auxiliares
async function getVendasPorDia(supabase: any, empresaId: string, startDate: Date, endDate: Date) {
  const { data } = await supabase
    .from('pedidos')
    .select('created_at, valor_total, status')
    .eq('empresa_id', empresaId)
    .eq('status', 'entregue')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at')

  const groupedByDay = data?.reduce((acc: any, pedido: any) => {
    const date = new Date(pedido.created_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { valor: 0, pedidos: 0 }
    }
    acc[date].valor += pedido.valor_total || 0
    acc[date].pedidos += 1
    return acc
  }, {} as Record<string, { valor: number; pedidos: number }>) || {}

  return Object.entries(groupedByDay).map(([data, stats]: [string, any]) => ({
    data,
    valor: stats.valor,
    pedidos: stats.pedidos
  }))
}

async function getPedidosPorStatus(supabase: any, empresaId: string, startDate: Date, endDate: Date) {
  const { data } = await supabase
    .from('pedidos')
    .select('status')
    .eq('empresa_id', empresaId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const statusCount = data?.reduce((acc: any, pedido: any) => {
    acc[pedido.status] = (acc[pedido.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const total = Object.values(statusCount).reduce((sum: number, count: number) => sum + count, 0)

  return Object.entries(statusCount).map(([status, quantidade]) => ({
    status,
    quantidade,
    percentual: total > 0 ? (quantidade / total) * 100 : 0
  }))
}

async function getTopProdutos(supabase: any, empresaId: string, startDate: Date, endDate: Date) {
  // Esta query seria mais complexa na prática, envolvendo pedido_items
  return [
    { nome: 'Hambúrguer Clássico', vendas: 45, receita: 675 },
    { nome: 'Pizza Margherita', vendas: 32, receita: 896 },
    { nome: 'Batata Frita', vendas: 28, receita: 168 }
  ]
}

async function getEmpresaSpecificMetrics(supabase: any, empresaId: string, startDate: Date, endDate: Date) {
  return {
    produtosMaisPedidos: [
      { nome: 'Hambúrguer', quantidade: 45 },
      { nome: 'Pizza', quantidade: 32 }
    ],
    horariosPopulares: [
      { hora: 12, pedidos: 15 },
      { hora: 19, pedidos: 25 }
    ],
    avaliacoesPorCriterio: {
      qualidade: 4.5,
      atendimento: 4.2,
      rapidez: 4.0
    }
  }
}

async function getGanhosPorDia(supabase: any, entregadorId: string, startDate: Date, endDate: Date) {
  const { data } = await supabase
    .from('pedidos')
    .select('created_at, taxa_entrega')
    .eq('entregador_id', entregadorId)
    .eq('status', 'entregue')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at')

  const groupedByDay = data?.reduce((acc: any, pedido: any) => {
    const date = new Date(pedido.created_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { valor: 0, pedidos: 0 }
    }
    acc[date].valor += pedido.taxa_entrega || 0
    acc[date].pedidos += 1
    return acc
  }, {} as Record<string, { valor: number; pedidos: number }>) || {}

  return Object.entries(groupedByDay).map(([data, stats]: [string, any]) => ({
    data,
    valor: stats.valor,
    pedidos: stats.pedidos
  }))
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isThisWeek(date: Date): boolean {
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  return date >= weekStart
}