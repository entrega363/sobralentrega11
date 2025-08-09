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

    // Construir query base com dados dos consumidores
    let query = supabase
      .from('consumidores')
      .select(`
        id,
        nome,
        cpf,
        endereco,
        contato,
        created_at,
        updated_at,
        profiles!inner(
          id,
          role
        ),
        auth_users:profiles(
          auth_user:auth.users(
            email
          )
        )
      `)
      .range(offset, offset + pageSize - 1)

    // Aplicar filtros de busca
    if (search) {
      query = query.or(`nome.ilike.%${search}%,cpf.ilike.%${search}%`)
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Executar query
    const { data, error } = await query

    if (error) throw error

    // Buscar emails dos usuários
    const consumidoresComEmail = await Promise.all(
      (data || []).map(async (consumidor) => {
        const { data: userData } = await supabase.auth.admin.getUserById(consumidor.profiles.id)
        
        return {
          id: consumidor.id,
          nome: consumidor.nome,
          email: userData.user?.email || 'N/A',
          telefone: consumidor.contato?.telefone || 'N/A',
          cpf: consumidor.cpf,
          endereco: consumidor.endereco,
          status: 'ativo', // Por enquanto fixo, pode ser implementado depois
          created_at: consumidor.created_at,
          updated_at: consumidor.updated_at,
          total_pedidos: 0 // Implementar contagem depois se necessário
        }
      })
    )

    // Buscar contagem total para paginação
    const { count: totalCount } = await supabase
      .from('consumidores')
      .select('*', { count: 'exact', head: true })

    return createSuccessResponse({
      consumidores: consumidoresComEmail,
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