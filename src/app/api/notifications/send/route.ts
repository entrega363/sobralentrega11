import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configurar VAPID keys (você deve gerar suas próprias chaves para produção)
webpush.setVapidDetails(
  'mailto:suporte@entregasobral.com.br',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI',
  process.env.VAPID_PRIVATE_KEY || 'your-private-vapid-key-here'
)

export async function POST(request: NextRequest) {
  try {
    const { userId, notification, userType } = await request.json()

    if (!userId || !notification) {
      return NextResponse.json(
        { error: 'userId e notification são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient()

    // Buscar subscriptions do usuário ou de todos os usuários de um tipo
    let query = supabase
      .from('push_subscriptions')
      .select('subscription, user_type')

    if (userId !== 'all') {
      query = query.eq('user_id', userId)
    } else if (userType) {
      query = query.eq('user_type', userType)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error('Erro ao buscar subscriptions:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'Nenhuma subscription encontrada' },
        { status: 200 }
      )
    }

    // Enviar notificações para todas as subscriptions
    const promises = subscriptions.map(async (sub) => {
      try {
        const subscription = JSON.parse(sub.subscription)
        await webpush.sendNotification(subscription, JSON.stringify(notification))
        return { success: true, userType: sub.user_type }
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Erro desconhecido', 
          userType: sub.user_type 
        }
      }
    })

    const results = await Promise.all(promises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Notificações enviadas: ${successful} sucesso, ${failed} falhas`,
      results
    })

  } catch (error) {
    console.error('Erro no endpoint de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para notificações automáticas baseadas em eventos
export async function PUT(request: NextRequest) {
  try {
    const { event, data } = await request.json()

    let notification
    let targetUserType
    let targetUserId

    switch (event) {
      case 'pedido_criado':
        notification = {
          title: 'Novo Pedido!',
          body: `Pedido #${data.numero} recebido - ${data.total}`,
          icon: '/icon-192x192.png',
          tag: `pedido-${data.id}`,
          data: { pedidoId: data.id, type: 'pedido_criado' }
        }
        targetUserId = data.empresa_id
        break

      case 'pedido_aceito':
        notification = {
          title: 'Pedido Aceito!',
          body: `Seu pedido #${data.numero} foi aceito pela empresa`,
          icon: '/icon-192x192.png',
          tag: `pedido-${data.id}`,
          data: { pedidoId: data.id, type: 'pedido_aceito' }
        }
        targetUserId = data.consumidor_id
        break

      case 'pedido_pronto':
        notification = {
          title: 'Pedido Pronto!',
          body: `Pedido #${data.numero} está pronto para entrega`,
          icon: '/icon-192x192.png',
          tag: `pedido-${data.id}`,
          data: { pedidoId: data.id, type: 'pedido_pronto' }
        }
        targetUserType = 'entregador'
        break

      case 'pedido_saiu_entrega':
        notification = {
          title: 'Saiu para Entrega!',
          body: `Seu pedido #${data.numero} saiu para entrega`,
          icon: '/icon-192x192.png',
          tag: `pedido-${data.id}`,
          data: { pedidoId: data.id, type: 'pedido_saiu_entrega' }
        }
        targetUserId = data.consumidor_id
        break

      case 'pedido_entregue':
        notification = {
          title: 'Pedido Entregue!',
          body: `Pedido #${data.numero} foi entregue com sucesso`,
          icon: '/icon-192x192.png',
          tag: `pedido-${data.id}`,
          data: { pedidoId: data.id, type: 'pedido_entregue' }
        }
        targetUserId = data.consumidor_id
        break

      default:
        return NextResponse.json(
          { error: 'Evento não reconhecido' },
          { status: 400 }
        )
    }

    // Enviar notificação
    const response = await fetch(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: targetUserId || 'all',
        userType: targetUserType,
        notification
      })
    })

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no endpoint de eventos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}