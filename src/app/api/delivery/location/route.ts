import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { pedidoId, entregadorId, latitude, longitude, accuracy, timestamp } = await request.json()

    if (!pedidoId || !entregadorId || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()

    // Verificar se o usuário é realmente o entregador do pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('entregador_id, status')
      .eq('id', pedidoId)
      .single()

    if (pedidoError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    if (pedido.entregador_id !== entregadorId) {
      return NextResponse.json(
        { error: 'Não autorizado para este pedido' },
        { status: 403 }
      )
    }

    if (pedido.status !== 'saiu_entrega') {
      return NextResponse.json(
        { error: 'Pedido não está em status de entrega' },
        { status: 400 }
      )
    }

    // Salvar/atualizar localização do entregador
    const { error: locationError } = await supabase
      .from('delivery_locations')
      .upsert({
        pedido_id: pedidoId,
        entregador_id: entregadorId,
        latitude,
        longitude,
        accuracy,
        timestamp: new Date(timestamp).toISOString(),
        updated_at: new Date().toISOString()
      })

    if (locationError) {
      console.error('Erro ao salvar localização:', locationError)
      return NextResponse.json(
        { error: 'Erro ao salvar localização' },
        { status: 500 }
      )
    }

    // Enviar notificação em tempo real via Supabase Realtime
    try {
      await supabase
        .channel('delivery-tracking')
        .send({
          type: 'broadcast',
          event: 'location-update',
          payload: {
            pedidoId,
            entregadorId,
            latitude,
            longitude,
            accuracy,
            timestamp
          }
        })
    } catch (realtimeError) {
      console.error('Erro ao enviar atualização em tempo real:', realtimeError)
    }

    return NextResponse.json({
      success: true,
      message: 'Localização atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro no endpoint de localização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pedidoId = searchParams.get('pedidoId')

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()

    // Buscar localização mais recente do entregador para este pedido
    const { data: location, error } = await supabase
      .from('delivery_locations')
      .select(`
        *,
        entregadores:entregador_id (
          nome,
          telefone
        )
      `)
      .eq('pedido_id', pedidoId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar localização:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar localização' },
        { status: 500 }
      )
    }

    if (!location) {
      return NextResponse.json(
        { message: 'Localização não disponível ainda' },
        { status: 200 }
      )
    }

    return NextResponse.json({
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        entregador: location.entregadores
      }
    })

  } catch (error) {
    console.error('Erro no endpoint de localização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}