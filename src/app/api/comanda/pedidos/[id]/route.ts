import { NextRequest, NextResponse } from 'next/server'
import { requireGarcomAuth, hasPermission } from '@/lib/auth/garcom-auth'
import { validateAtualizarPedidoLocal } from '@/lib/validations/garcom'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// PUT /api/comanda/pedidos/[id] - Editar/cancelar pedido local
export const PUT = requireGarcomAuth(async (request: NextRequest, garcom) => {
  try {
    const url = new URL(request.url)
    const pedidoId = url.pathname.split('/').pop()

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validar dados de entrada
    const validation = validateAtualizarPedidoLocal(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { observacoes_garcom, status } = validation.data
    const supabase = createClient()

    // Verificar se o pedido existe e pertence ao garçom
    const { data: pedidoExistente, error: pedidoError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .eq('garcom_id', garcom.garcomId)
      .eq('tipo_pedido', 'local')
      .single()

    if (pedidoError || !pedidoExistente) {
      return NextResponse.json(
        { error: 'Pedido não encontrado ou não pertence a você' },
        { status: 404 }
      )
    }

    // Verificar permissões baseadas na ação
    if (status === 'cancelado') {
      if (!hasPermission(garcom, 'cancelar_pedidos')) {
        return NextResponse.json(
          { error: 'Você não tem permissão para cancelar pedidos' },
          { status: 403 }
        )
      }

      // Verificar se o pedido pode ser cancelado (não pode estar em preparo ou pronto)
      if (['preparando', 'pronto', 'entregue'].includes(pedidoExistente.status)) {
        return NextResponse.json(
          { error: 'Não é possível cancelar um pedido que já está sendo preparado ou foi entregue' },
          { status: 400 }
        )
      }
    }

    if (observacoes_garcom !== undefined) {
      if (!hasPermission(garcom, 'editar_pedidos')) {
        return NextResponse.json(
          { error: 'Você não tem permissão para editar pedidos' },
          { status: 403 }
        )
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {
      updated_at: new Date().toISOString()
    }

    if (observacoes_garcom !== undefined) {
      dadosAtualizacao.observacoes_garcom = observacoes_garcom
    }

    if (status) {
      dadosAtualizacao.status = status
    }

    // Atualizar pedido
    const { data: pedidoAtualizado, error: updateError } = await supabase
      .from('pedidos')
      .update(dadosAtualizacao)
      .eq('id', pedidoId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar pedido' },
        { status: 500 }
      )
    }

    // Registrar atividade do garçom
    const acao = status === 'cancelado' ? 'cancelar_pedido' : 'editar_pedido'
    await supabase
      .from('garcon_atividades')
      .insert({
        garcom_id: garcom.garcomId,
        acao,
        detalhes: {
          pedido_id: pedidoId,
          alteracoes: dadosAtualizacao,
          status_anterior: pedidoExistente.status,
          status_novo: status || pedidoExistente.status
        },
        pedido_id: pedidoId
      })

    // Buscar pedido completo com itens
    const { data: pedidoCompleto, error: fetchError } = await supabase
      .from('pedidos')
      .select(`
        *,
        pedido_itens (
          *,
          produtos (
            id,
            nome,
            preco
          )
        )
      `)
      .eq('id', pedidoId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar pedido atualizado:', fetchError)
      return NextResponse.json(
        { error: 'Pedido atualizado, mas erro ao buscar dados completos' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const pedidoFormatado = {
      id: pedidoCompleto.id,
      numero: `#${pedidoCompleto.id.slice(-6).toUpperCase()}`,
      mesa: pedidoCompleto.mesa,
      status: pedidoCompleto.status,
      total: pedidoCompleto.total,
      created_at: pedidoCompleto.created_at,
      updated_at: pedidoCompleto.updated_at,
      observacoes_garcom: pedidoCompleto.observacoes_garcom,
      cliente_nome: pedidoCompleto.cliente_nome,
      itens: pedidoCompleto.pedido_itens?.map((item: any) => ({
        id: item.id,
        produto: {
          id: item.produtos.id,
          nome: item.produtos.nome,
          preco: item.produtos.preco
        },
        quantidade: item.quantidade,
        observacoes: item.observacoes
      })) || []
    }

    return NextResponse.json({
      pedido: pedidoFormatado,
      message: status === 'cancelado' ? 'Pedido cancelado com sucesso' : 'Pedido atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})

// GET /api/comanda/pedidos/[id] - Buscar pedido específico
export const GET = requireGarcomAuth(async (request: NextRequest, garcom) => {
  try {
    const url = new URL(request.url)
    const pedidoId = url.pathname.split('/').pop()

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Buscar pedido com itens
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        pedido_itens (
          *,
          produtos (
            id,
            nome,
            preco
          )
        )
      `)
      .eq('id', pedidoId)
      .eq('garcom_id', garcom.garcomId)
      .eq('tipo_pedido', 'local')
      .single()

    if (error || !pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado ou não pertence a você' },
        { status: 404 }
      )
    }

    // Formatar pedido
    const pedidoFormatado = {
      id: pedido.id,
      numero: `#${pedido.id.slice(-6).toUpperCase()}`,
      mesa: pedido.mesa,
      status: pedido.status,
      total: pedido.total,
      created_at: pedido.created_at,
      updated_at: pedido.updated_at,
      observacoes_garcom: pedido.observacoes_garcom,
      cliente_nome: pedido.cliente_nome,
      itens: pedido.pedido_itens?.map((item: any) => ({
        id: item.id,
        produto: {
          id: item.produtos.id,
          nome: item.produtos.nome,
          preco: item.produtos.preco
        },
        quantidade: item.quantidade,
        observacoes: item.observacoes
      })) || []
    }

    return NextResponse.json({
      pedido: pedidoFormatado
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})