import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de query
    const status = searchParams.get('status')
    const categoria = searchParams.get('categoria')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query
    let query = supabase
      .from('empresas')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }
    
    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    const { data, error, count } = await query

    if (error) throw error

    return createSuccessResponse({
      empresas: data,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Apenas administradores podem criar empresas' }, { status: 403 })
    }

    // Validar e inserir dados
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('empresas')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return createSuccessResponse(data, 201)
  } catch (error) {
    return handleApiError(error)
  }
}