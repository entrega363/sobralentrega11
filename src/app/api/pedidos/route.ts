import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { pedidoSchema } from '@/lib/validations/pedido'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    // Parâmetros de query
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query baseada no role
    let query = supabase
      .from('pedidos')
      .select(`
        *,
        consumidores (
          nome,
          contato
        ),
        entregadores (
          nome,
          contato
        ),
        pedido_itens (
          *,
          produtos (
            nome,
            preco
          ),
          empresas (
            nome
          )
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Filtrar baseado no role
    if (profile.role === 'consumidor') {
      const { data: consumidor } = await supabase
        .from('consumidores')
        .select('id')
        .eq('profile_id', session.user.id)
        .single()

      if (consumidor) {
        query = query.eq('consumidor_id', consumidor.id)
      }
    } else if (profile.role === 'empresa') {
      // Para empresas, buscar pedidos que contenham produtos da empresa
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('profile_id', session.user.id)
        .single()

      if (empresa) {
        // Buscar IDs dos pedidos que contêm produtos da empresa
        const { data: pedidoIds } = await supabase
          .from('pedido_itens')
          .select('pedido_id')
          .eq('empresa_id', empresa.id)

        if (pedidoIds && pedidoIds.length > 0) {
          const ids = pedidoIds.map(item => item.pedido_id)
          query = query.in('id', ids)
        } else {
          // Se não há pedidos, retornar array vazio
          return createSuccessResponse({
            pedidos: [],
            total: 0,
            limit,
            offset
          })
        }
      }
    } else if (profile.role === 'entregador') {
      const { data: entregador } = await supabase
        .from('entregadores')
        .select('id')
        .eq('profile_id', session.user.id)
        .single()

      if (entregador) {
        // Mostrar pedidos do entregador ou disponíveis para entrega
        query = query.or(`entregador_id.eq.${entregador.id},and(entregador_id.is.null,status.eq.pronto)`)
      }
    }
    // Admin pode ver todos os pedidos (sem filtro adicional)

    // Aplicar filtro de status se fornecido
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) throw error

    return createSuccessResponse({
      pedidos: data,
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
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é um consumidor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'consumidor') {
      return NextResponse.json({ error: 'Apenas consumidores podem criar pedidos' }, { status: 403 })
    }

    // Buscar consumidor
    const { data: consumidor } = await supabase
      .from('consumidores')
      .select('id')
      .eq('profile_id', session.user.id)
      .single()

    if (!consumidor) {
      return NextResponse.json({ error: 'Consumidor não encontrado' }, { status: 404 })
    }

    // Validar dados
    const body = await request.json()
    const validatedData = pedidoSchema.parse(body)

    // Calcular total dos itens
    const total = validatedData.itens.reduce(
      (sum, item) => sum + (item.quantidade * item.preco_unitario), 
      0
    )

    // Criar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        consumidor_id: consumidor.id,
        endereco_entrega: validatedData.endereco_entrega,
        observacoes: validatedData.observacoes,
        forma_pagamento: validatedData.forma_pagamento,
        tipo_entrega: validatedData.tipo_entrega,
        total,
      })
      .select()
      .single()

    if (pedidoError) throw pedidoError

    // Criar itens do pedido
    const itensComPedidoId = validatedData.itens.map(item => ({
      ...item,
      pedido_id: pedido.id,
    }))

    const { error: itensError } = await supabase
      .from('pedido_itens')
      .insert(itensComPedidoId)

    if (itensError) throw itensError

    // Buscar pedido completo
    const { data: pedidoCompleto, error: fetchError } = await supabase
      .from('pedidos')
      .select(`
        *,
        consumidores (
          nome,
          contato
        ),
        pedido_itens (
          *,
          produtos (
            nome,
            preco
          ),
          empresas (
            nome
          )
        )
      `)
      .eq('id', pedido.id)
      .single()

    if (fetchError) throw fetchError

    return createSuccessResponse(pedidoCompleto, 201)
  } catch (error) {
    return handleApiError(error)
  }
}