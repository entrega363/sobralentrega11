import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { produtoSchema } from '@/lib/validations/produto'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = createRouteHandlerClient()
    
    const { data, error } = await supabase
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
      .eq('id', resolvedParams.id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return createSuccessResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
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

    // Verificar se o produto pertence à empresa
    const { data: produto } = await supabase
      .from('produtos')
      .select('empresa_id')
      .eq('id', resolvedParams.id)
      .single()

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (produto.empresa_id !== empresa.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Validar dados
    const body = await request.json()
    const validatedData = produtoSchema.partial().parse(body)

    // Atualizar produto
    const { data, error } = await supabase
      .from('produtos')
      .update(validatedData)
      .eq('id', resolvedParams.id)
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

    return createSuccessResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
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

    // Verificar se o produto pertence à empresa
    const { data: produto } = await supabase
      .from('produtos')
      .select('empresa_id')
      .eq('id', resolvedParams.id)
      .single()

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (produto.empresa_id !== empresa.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Deletar produto
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', resolvedParams.id)

    if (error) throw error

    return createSuccessResponse({ message: 'Produto deletado com sucesso' })
  } catch (error) {
    return handleApiError(error)
  }
}