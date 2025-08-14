import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
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
    
    // Parâmetros de query
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const empresa_id = searchParams.get('empresa_id')
    const entregador_id = searchParams.get('entregador_id')
    const data_inicio = searchParams.get('data_inicio')
    const data_fim = searchParams.get('data_fim')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calcular offset
    const offset = (page - 1) * pageSize

    // Construir query base com joins
    let query = supabase
      .from('pedidos')
      .select(`
        id,
        status,
        valor_total,
        taxa_entrega,
        created_at,
        updated_at,
        consumidor:consumidor_id(id, nome, email),
        empresa:empresa_id(id, nome),
        entregador:entregador_id(id, nome)
      `)
      .range(offset, offset + pageSize - 1)

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }

    if (empresa_id) {
      query = query.eq('empresa_id', empresa_id)
    }

    if (entregador_id) {
      query = query.eq('entregador_id', entregador_id)
    }

    if (data_inicio) {
      query = query.gte('created_at', data_inicio)
    }

    if (data_fim) {
      query = query.lte('created_at', data_fim)
    }

    if (search) {
      // Para busca, vamos buscar por ID do pedido ou nome do cliente
      query = query.or(`id.ilike.%${search}%`)
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Executar query
    const { data, error } = await query

    if (error) throw error

    // Processar dados para formato mais amigável
    const pedidos = data?.map((pedido: any) => ({
      id: pedido.id,
      cliente_nome: pedido.consumidor?.nome || 'N/A',
      cliente_email: pedido.consumidor?.email || 'N/A',
      empresa_nome: pedido.empresa?.nome || 'N/A',
      entregador_nome: pedido.entregador?.nome || null,
      status: pedido.status,
      valor_total: pedido.valor_total,
      taxa_entrega: pedido.taxa_entrega,
      created_at: pedido.created_at,
      updated_at: pedido.updated_at
    })) || []

    // Buscar contagem total para paginação
    let countQuery = supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    if (empresa_id) {
      countQuery = countQuery.eq('empresa_id', empresa_id)
    }

    if (entregador_id) {
      countQuery = countQuery.eq('entregador_id', entregador_id)
    }

    if (data_inicio) {
      countQuery = countQuery.gte('created_at', data_inicio)
    }

    if (data_fim) {
      countQuery = countQuery.lte('created_at', data_fim)
    }

    const { count: totalCount } = await countQuery

    return createSuccessResponse({
      pedidos,
      pagination: {
        page,
        pageSize,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / pageSize)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}