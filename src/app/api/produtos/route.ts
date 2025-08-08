import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { produtoSchema } from '@/lib/validations/produto'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(rateLimitConfigs.general)(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente mais tarde.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '',
        }
      }
    )
  }

  try {
    const supabase = createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de query
    const empresaId = searchParams.get('empresa_id')
    const categoria = searchParams.get('categoria')
    const disponivel = searchParams.get('disponivel')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query
    let query = supabase
      .from('produtos')
      .select(`
        *,
        empresas (
          id,
          nome,
          endereco,
          configuracoes
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (empresaId) {
      query = query.eq('empresa_id', empresaId)
    }
    
    if (categoria) {
      query = query.eq('categoria', categoria)
    }
    
    if (disponivel !== null) {
      query = query.eq('disponivel', disponivel === 'true')
    }

    const { data, error, count } = await query

    if (error) throw error

    return createSuccessResponse({
      produtos: data,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting para criação
  const rateLimitResult = rateLimit(rateLimitConfigs.create)(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente mais tarde.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '',
        }
      }
    )
  }

  try {
    const supabase = createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é uma empresa
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'empresa') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar empresa do usuário
    const { data: empresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('profile_id', session.user.id)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Validar dados
    const body = await request.json()
    console.log('Dados recebidos para validação:', body)
    
    try {
      const validatedData = produtoSchema.parse(body)
      console.log('Dados validados com sucesso:', validatedData)
    } catch (validationError) {
      console.error('Erro de validação:', validationError)
      throw validationError
    }
    
    const validatedData = produtoSchema.parse(body)

    // Inserir produto
    const { data, error } = await supabase
      .from('produtos')
      .insert({
        ...validatedData,
        empresa_id: empresa.id,
      })
      .select(`
        *,
        empresas (
          id,
          nome,
          endereco,
          configuracoes
        )
      `)
      .single()

    if (error) throw error

    return createSuccessResponse(data, 201)
  } catch (error) {
    return handleApiError(error)
  }
}