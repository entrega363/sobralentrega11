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
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calcular offset
    const offset = (page - 1) * pageSize

    // Construir query base com dados das empresas
    let query = supabase
      .from('empresas')
      .select(`
        id,
        nome,
        cnpj,
        categoria,
        endereco,
        contato,
        status,
        created_at,
        updated_at,
        profile_id
      `)
      .range(offset, offset + pageSize - 1)

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`nome.ilike.%${search}%,cnpj.ilike.%${search}%`)
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Executar query
    const { data, error } = await query

    if (error) throw error

    // Buscar emails dos usuários
    const empresasComEmail = await Promise.all(
      (data || []).map(async (empresa: any) => {
        const { data: userData } = await supabase.auth.admin.getUserById(empresa.profile_id)
        
        return {
          id: empresa.id,
          nome: empresa.nome,
          email: userData.user?.email || 'N/A',
          cnpj: empresa.cnpj,
          categoria: empresa.categoria,
          telefone: empresa.contato?.telefone || 'N/A',
          endereco: empresa.endereco,
          status: empresa.status,
          created_at: empresa.created_at,
          updated_at: empresa.updated_at
        }
      })
    )

    // Buscar contagem total para paginação
    const { count: totalCount } = await supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true })

    return createSuccessResponse({
      empresas: empresasComEmail,
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