import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { resposta } = await request.json()
    const ratingId = params.id

    if (!resposta || !resposta.trim()) {
      return NextResponse.json(
        { error: 'Resposta é obrigatória' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient()

    // Verificar se a avaliação existe
    const { data: rating, error: ratingError } = await supabase
      .from('avaliacoes')
      .select('avaliado_id, avaliador_nome, tipo_avaliacao')
      .eq('id', ratingId)
      .single()

    if (ratingError || !rating) {
      return NextResponse.json(
        { error: 'Avaliação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário atual é o avaliado
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== rating.avaliado_id) {
      return NextResponse.json(
        { error: 'Você só pode responder suas próprias avaliações' },
        { status: 403 }
      )
    }

    // Atualizar a avaliação com a resposta
    const { error: updateError } = await supabase
      .from('avaliacoes')
      .update({
        resposta: resposta.trim(),
        respondido_em: new Date().toISOString()
      })
      .eq('id', ratingId)

    if (updateError) {
      console.error('Erro ao atualizar avaliação:', updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar resposta' },
        { status: 500 }
      )
    }

    // Enviar notificação para o avaliador
    try {
      await fetch(`${request.nextUrl.origin}/api/notifications/send`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'resposta_avaliacao',
          data: {
            avaliador_id: rating.avaliado_id, // Quem fez a avaliação original
            tipo_avaliacao: rating.tipo_avaliacao,
            respondeu: true
          }
        })
      })
    } catch (notificationError) {
      console.error('Erro ao enviar notificação:', notificationError)
    }

    return NextResponse.json({
      message: 'Resposta enviada com sucesso'
    })

  } catch (error) {
    console.error('Erro no endpoint de resposta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}