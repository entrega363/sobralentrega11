import { NextRequest, NextResponse } from 'next/server'
import { requireGarcomAuth } from '@/lib/auth/garcom-auth'
import { validateCriarPedidoLocal } from '@/lib/validations/garcom'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// GET /api/comanda/pedidos - Listar pedidos do garçom
export const GET = requireGarcomAuth(async (request: NextRequest, garcom) => {
  try {
    const supabase = createClient()
    
    // Buscar pedidos do garçom
    const { data: pedidos, error } = await supabase
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
      .eq('garcom_id', garcom.garcomId)
      .eq('tipo_pedido', 'local')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar pedidos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar pedidos' },
        { status: 500 }
      )
    }

    // Formatar pedidos para o frontend
    const pedidosFormatados = pedidos?.map(pedido => ({
      id: pedido.id,
      numero: `#${pedido.id.slice(-6).toUpperCase()}`,
      mesa: pedido.mesa,
      status: pedido.status,
      total: pedido.total,
      created_at: pedido.created_at,
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
    })) || []

    return NextResponse.json({
      pedidos: pedidosFormatados
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})

// POST /api/comanda/pedidos - Criar pedido local
export const POST = requireGarcomAuth(async (request: NextRequest, garcom) => {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = validateCriarPedidoLocal(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { produtos, mesa, cliente_nome, observacoes_garcom } = validation.data
    const supabase = createClient()

    // Verificar se os produtos existem e pertencem à empresa do garçom
    const produtoIds = produtos.map(p => p.produto_id)
    const { data: produtosValidos, error: produtosError } = await supabase
      .from('produtos')
      .select('id, nome, preco, empresa_id')
      .in('id', produtoIds)
      .eq('empresa_id', garcom.empresaId)

    if (produtosError) {
      console.error('Erro ao validar produtos:', produtosError)
      return NextResponse.json(
        { error: 'Erro ao validar produtos' },
        { status: 500 }
      )
    }

    if (!produtosValidos || produtosValidos.length !== produtoIds.length) {
      return NextResponse.json(
        { error: 'Um ou mais produtos são inválidos ou não pertencem à sua empresa' },
        { status: 400 }
      )
    }

    // Calcular total do pedido
    let total = 0
    const itensComPreco = produtos.map(item => {
      const produto = produtosValidos.find(p => p.id === item.produto_id)
      if (!produto) {
        throw new Error(`Produto ${item.produto_id} não encontrado`)
      }
      const subtotal = produto.preco * item.quantidade
      total += subtotal
      return {
        ...item,
        preco_unitario: produto.preco,
        subtotal
      }
    })

    // Iniciar transação
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        empresa_id: garcom.empresaId,
        garcom_id: garcom.garcomId,
        tipo_pedido: 'local',
        mesa,
        cliente_nome: cliente_nome || null,
        observacoes_garcom: observacoes_garcom || null,
        status: 'pendente',
        total,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (pedidoError) {
      console.error('Erro ao criar pedido:', pedidoError)
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Inserir itens do pedido
    const itensParaInserir = itensComPreco.map(item => ({
      pedido_id: pedido.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      observacoes: item.observacoes || null
    }))

    const { error: itensError } = await supabase
      .from('pedido_itens')
      .insert(itensParaInserir)

    if (itensError) {
      console.error('Erro ao inserir itens:', itensError)
      // Tentar reverter o pedido criado
      await supabase.from('pedidos').delete().eq('id', pedido.id)
      return NextResponse.json(
        { error: 'Erro ao criar itens do pedido' },
        { status: 500 }
      )
    }

    // Registrar atividade do garçom
    await supabase
      .from('garcon_atividades')
      .insert({
        garcom_id: garcom.garcomId,
        acao: 'criar_pedido',
        detalhes: {
          pedido_id: pedido.id,
          mesa,
          total,
          itens_count: produtos.length
        },
        pedido_id: pedido.id
      })

    // Retornar pedido criado
    const pedidoCompleto = {
      id: pedido.id,
      numero: `#${pedido.id.slice(-6).toUpperCase()}`,
      mesa: pedido.mesa,
      status: pedido.status,
      total: pedido.total,
      created_at: pedido.created_at,
      observacoes_garcom: pedido.observacoes_garcom,
      cliente_nome: pedido.cliente_nome,
      itens: itensComPreco.map(item => {
        const produto = produtosValidos.find(p => p.id === item.produto_id)
        return {
          produto: {
            id: produto!.id,
            nome: produto!.nome,
            preco: produto!.preco
          },
          quantidade: item.quantidade,
          observacoes: item.observacoes
        }
      })
    }

    return NextResponse.json({
      pedido: pedidoCompleto,
      message: 'Pedido criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})