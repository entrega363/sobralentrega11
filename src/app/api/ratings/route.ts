import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('targetId')
    const type = searchParams.get('type')
    const pedidoId = searchParams.get('pedidoId')

    const supabase = await createRouteHandlerClient()

    let query = supabase
      .from('avaliacoes')
      .select(`
        *,
        pedidos:pedido_id (
          numero,
          total
        )
      `)
      .order('created_at', { ascending: false })

    // Filtros
    if (targetId) {
      query = query.eq('avaliado_id', targetId)
    }
    
    if (type) {
      query = query.eq('tipo_avaliacao', type)
    }
    
    if (pedidoId) {
      query = query.eq('pedido_id', pedidoId)
    }

    const { data: ratings, error } = await query

    if (error) {
      console.error('Erro ao buscar avaliações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar avaliações' },
        { status: 500 }
      )
    }

    // Calcular estatísticas se targetId foi fornecido
    let stats = null
    if (targetId && ratings && ratings.length > 0) {
      const totalAvaliacoes = ratings.length
      const somaNotas = ratings.reduce((sum, r) => sum + r.nota_geral, 0)
      const mediaGeral = somaNotas / totalAvaliacoes

      // Distribuição de notas
      const distribuicao = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      ratings.forEach(r => {
        const nota = Math.floor(r.nota_geral)
        if (nota >= 1 && nota <= 5) {
          distribuicao[nota as keyof typeof distribuicao]++
        }
      })

      // Médias por critério
      const criterios = {
        qualidade: ratings.filter(r => r.nota_qualidade).reduce((sum, r) => sum + (r.nota_qualidade || 0), 0) / ratings.filter(r => r.nota_qualidade).length || 0,
        atendimento: ratings.filter(r => r.nota_atendimento).reduce((sum, r) => sum + (r.nota_atendimento || 0), 0) / ratings.filter(r => r.nota_atendimento).length || 0,
        pontualidade: ratings.filter(r => r.nota_pontualidade).reduce((sum, r) => sum + (r.nota_pontualidade || 0), 0) / ratings.filter(r => r.nota_pontualidade).length || 0,
        embalagem: ratings.filter(r => r.nota_embalagem).reduce((sum, r) => sum + (r.nota_embalagem || 0), 0) / ratings.filter(r => r.nota_embalagem).length || 0
      }

      // Badges baseados na performance
      const badges = []
      if (mediaGeral >= 4.8) badges.push('Excelência')
      if (mediaGeral >= 4.5) badges.push('Qualidade Premium')
      if (criterios.pontualidade >= 4.5) badges.push('Sempre Pontual')
      if (criterios.atendimento >= 4.5) badges.push('Atendimento 5 Estrelas')
      if (totalAvaliacoes >= 100) badges.push('Veterano')
      if (totalAvaliacoes >= 50) badges.push('Experiente')

      stats = {
        media_geral: Number(mediaGeral.toFixed(1)),
        total_avaliacoes: totalAvaliacoes,
        distribuicao,
        criterios: {
          qualidade: Number(criterios.qualidade.toFixed(1)),
          atendimento: Number(criterios.atendimento.toFixed(1)),
          pontualidade: Number(criterios.pontualidade.toFixed(1)),
          embalagem: Number(criterios.embalagem.toFixed(1))
        },
        badges
      }
    }

    return NextResponse.json({
      ratings: ratings?.map(rating => ({
        ...rating,
        pedido_numero: rating.pedidos?.numero,
        pedido_total: rating.pedidos?.total
      })) || [],
      stats
    })

  } catch (error) {
    console.error('Erro no endpoint de avaliações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      pedido_id,
      avaliado_id,
      avaliado_nome,
      tipo_avaliacao,
      nota_geral,
      nota_qualidade,
      nota_atendimento,
      nota_pontualidade,
      nota_embalagem,
      comentario,
      pontos_positivos,
      pontos_negativos,
      avaliador_id,
      avaliador_nome
    } = await request.json()

    // Validações
    if (!pedido_id || !avaliado_id || !tipo_avaliacao || !nota_geral || !avaliador_id) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    if (nota_geral < 1 || nota_geral > 5) {
      return NextResponse.json(
        { error: 'Nota deve estar entre 1 e 5' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()

    // Verificar se o usuário já avaliou este pedido
    const { data: existingRating } = await supabase
      .from('avaliacoes')
      .select('id')
      .eq('pedido_id', pedido_id)
      .eq('avaliador_id', avaliador_id)
      .single()

    if (existingRating) {
      return NextResponse.json(
        { error: 'Você já avaliou este pedido' },
        { status: 400 }
      )
    }

    // Verificar se o pedido existe e foi entregue
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('status, consumidor_id, empresa_id, entregador_id')
      .eq('id', pedido_id)
      .single()

    if (pedidoError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    if (pedido.status !== 'entregue') {
      return NextResponse.json(
        { error: 'Só é possível avaliar pedidos entregues' },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem permissão para avaliar
    const canRate = (
      (tipo_avaliacao === 'empresa' && pedido.consumidor_id === avaliador_id) ||
      (tipo_avaliacao === 'entregador' && pedido.consumidor_id === avaliador_id) ||
      (tipo_avaliacao === 'consumidor' && (pedido.empresa_id === avaliador_id || pedido.entregador_id === avaliador_id))
    )

    if (!canRate) {
      return NextResponse.json(
        { error: 'Você não tem permissão para avaliar este pedido' },
        { status: 403 }
      )
    }

    // Criar avaliação
    const { data: rating, error: ratingError } = await supabase
      .from('avaliacoes')
      .insert({
        pedido_id,
        avaliador_id,
        avaliador_nome,
        avaliado_id,
        avaliado_nome,
        tipo_avaliacao,
        nota_geral,
        nota_qualidade,
        nota_atendimento,
        nota_pontualidade,
        nota_embalagem,
        comentario,
        pontos_positivos,
        pontos_negativos
      })
      .select()
      .single()

    if (ratingError) {
      console.error('Erro ao criar avaliação:', ratingError)
      return NextResponse.json(
        { error: 'Erro ao criar avaliação' },
        { status: 500 }
      )
    }

    // Enviar notificação para o avaliado
    try {
      await fetch(`${request.nextUrl.origin}/api/notifications/send`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'nova_avaliacao',
          data: {
            avaliado_id,
            avaliador_nome,
            nota_geral,
            tipo_avaliacao
          }
        })
      })
    } catch (notificationError) {
      console.error('Erro ao enviar notificação:', notificationError)
    }

    return NextResponse.json({
      rating,
      message: 'Avaliação criada com sucesso'
    })

  } catch (error) {
    console.error('Erro no endpoint de avaliações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}