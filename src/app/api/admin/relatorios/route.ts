import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const periodo = parseInt(searchParams.get('periodo') || '30') // dias

    // Calcular data de início baseada no período
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - periodo)
    const dataInicioISO = dataInicio.toISOString()

    // Data de hoje
    const hoje = new Date()
    const hojeInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()

    try {
      // Buscar métricas em paralelo
      const [
        totalPedidosResult,
        receitaTotalResult,
        empresasAtivasResult,
        entregadoresAtivosResult,
        pedidosHojeResult,
        receitaHojeResult,
        pedidosPeriodoAnteriorResult,
        ticketMedioResult
      ] = await Promise.all([
        // Total de pedidos no período
        supabase
          .from('pedidos')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dataInicioISO)
          .neq('status', 'cancelado'),

        // Receita total no período
        supabase
          .from('pedidos')
          .select('valor_total')
          .gte('created_at', dataInicioISO)
          .eq('status', 'entregue'),

        // Empresas ativas
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'empresa')
          .eq('status', 'aprovado'),

        // Entregadores ativos
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'entregador')
          .eq('status', 'aprovado'),

        // Pedidos hoje
        supabase
          .from('pedidos')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', hojeInicio)
          .neq('status', 'cancelado'),

        // Receita hoje
        supabase
          .from('pedidos')
          .select('valor_total')
          .gte('created_at', hojeInicio)
          .eq('status', 'entregue'),

        // Pedidos do período anterior (para calcular crescimento)
        supabase
          .from('pedidos')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(dataInicio.getTime() - (periodo * 24 * 60 * 60 * 1000)).toISOString())
          .lt('created_at', dataInicioISO)
          .neq('status', 'cancelado'),

        // Ticket médio
        supabase
          .from('pedidos')
          .select('valor_total')
          .gte('created_at', dataInicioISO)
          .eq('status', 'entregue')
      ])

      // Processar resultados
      const totalPedidos = totalPedidosResult.count || 0
      const receitaTotal = receitaTotalResult.data?.reduce((sum: number, pedido: any) => sum + (pedido.valor_total || 0), 0) || 0
      const empresasAtivas = empresasAtivasResult.count || 0
      const entregadoresAtivos = entregadoresAtivosResult.count || 0
      const pedidosHoje = pedidosHojeResult.count || 0
      const receitaHoje = receitaHojeResult.data?.reduce((sum: number, pedido: any) => sum + (pedido.valor_total || 0), 0) || 0
      const pedidosPeriodoAnterior = pedidosPeriodoAnteriorResult.count || 0
      
      // Calcular crescimento mensal
      const crescimentoMensal = pedidosPeriodoAnterior > 0 
        ? ((totalPedidos - pedidosPeriodoAnterior) / pedidosPeriodoAnterior) * 100 
        : 0

      // Calcular ticket médio
      const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0

      // Buscar dados para gráficos (últimos 7 dias)
      const ultimosSete = new Date()
      ultimosSete.setDate(ultimosSete.getDate() - 7)

      const { data: pedidosPorDia } = await supabase
        .from('pedidos')
        .select('created_at, valor_total')
        .gte('created_at', ultimosSete.toISOString())
        .neq('status', 'cancelado')
        .order('created_at', { ascending: true })

      // Agrupar pedidos por dia
      const pedidosPorDiaAgrupados = pedidosPorDia?.reduce((acc: any, pedido: any) => {
        const data = new Date(pedido.created_at).toISOString().split('T')[0]
        if (!acc[data]) {
          acc[data] = { data, pedidos: 0, receita: 0 }
        }
        acc[data].pedidos += 1
        acc[data].receita += pedido.valor_total || 0
        return acc
      }, {} as Record<string, { data: string, pedidos: number, receita: number }>) || {}

      // Buscar top empresas por receita
      const { data: topEmpresas } = await supabase
        .from('pedidos')
        .select(`
          empresa_id,
          valor_total,
          empresa:empresa_id(nome)
        `)
        .gte('created_at', dataInicioISO)
        .eq('status', 'entregue')

      const empresasPorReceita = topEmpresas?.reduce((acc: any, pedido: any) => {
        const empresaId = pedido.empresa_id
        const empresaNome = pedido.empresa?.nome || 'N/A'
        
        if (!acc[empresaId]) {
          acc[empresaId] = { nome: empresaNome, receita: 0, pedidos: 0 }
        }
        acc[empresaId].receita += pedido.valor_total || 0
        acc[empresaId].pedidos += 1
        return acc
      }, {} as Record<string, { nome: string, receita: number, pedidos: number }>) || {}

      const topEmpresasArray = Object.values(empresasPorReceita)
        .sort((a, b) => b.receita - a.receita)
        .slice(0, 5)

      const relatorioData = {
        metricas: {
          totalPedidos,
          receitaTotal,
          empresasAtivas,
          entregadoresAtivos,
          pedidosHoje,
          receitaHoje,
          crescimentoMensal: Math.round(crescimentoMensal * 100) / 100,
          ticketMedio: Math.round(ticketMedio * 100) / 100
        },
        graficos: {
          pedidosPorDia: Object.values(pedidosPorDiaAgrupados),
          topEmpresas: topEmpresasArray
        },
        periodo: {
          dias: periodo,
          dataInicio: dataInicioISO,
          dataFim: new Date().toISOString()
        }
      }

      return createSuccessResponse(relatorioData)
    } catch (queryError) {
      console.error('Error in queries:', queryError)
      throw queryError
    }
  } catch (error) {
    return handleApiError(error)
  }
}