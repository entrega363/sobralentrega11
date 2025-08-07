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
    
    // Parâmetros de query
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calcular offset
    const offset = (page - 1) * pageSize

    // Construir query base
    let query = supabase
      .from('profiles')
      .select(`
        id,
        nome,
        email,
        telefone,
        endereco,
        cnpj,
        status,
        created_at,
        updated_at,
        aprovada_em,
        rejeitada_em,
        motivo_rejeicao
      `)
      .eq('role', 'empresa')
      .range(offset, offset + pageSize - 1)

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,cnpj.ilike.%${search}%`)
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Executar query
    const { data, error, count } = await query

    if (error) throw error

    // Buscar contagem total para paginação
    let countQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'empresa')

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    if (search) {
      countQuery = countQuery.or(`nome.ilike.%${search}%,email.ilike.%${search}%,cnpj.ilike.%${search}%`)
    }

    const { count: totalCount } = await countQuery

    return createSuccessResponse({
      empresas: data || [],
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