import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID da conversa é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário faz parte da conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversas')
      .select('participantes')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      )
    }

    if (!conversation.participantes.includes(user.id)) {
      return NextResponse.json(
        { error: 'Você não tem acesso a esta conversa' },
        { status: 403 }
      )
    }

    // Buscar mensagens da conversa
    const { data: messages, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('conversa_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar mensagens:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar mensagens' },
        { status: 500 }
      )
    }

    // Marcar mensagens não lidas como lidas
    const unreadMessages = messages?.filter(msg => 
      !msg.lida && msg.remetente_id !== user.id
    ) || []

    if (unreadMessages.length > 0) {
      await supabase
        .from('mensagens')
        .update({ lida: true })
        .in('id', unreadMessages.map(msg => msg.id))
    }

    return NextResponse.json({
      messages: messages || []
    })

  } catch (error) {
    console.error('Erro no endpoint de mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      conversationId,
      content,
      type = 'texto',
      attachmentUrl,
      attachmentName
    } = await request.json()

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: 'ID da conversa e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar dados do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, role')
      .eq('id', user.id)
      .single()

    const userName = profile?.nome || user.email || 'Usuário'
    const userRole = profile?.role || 'consumidor'

    // Verificar se o usuário faz parte da conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversas')
      .select('participantes')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      )
    }

    if (!conversation.participantes.includes(user.id)) {
      return NextResponse.json(
        { error: 'Você não tem acesso a esta conversa' },
        { status: 403 }
      )
    }

    // Criar mensagem
    const { data: message, error: messageError } = await supabase
      .from('mensagens')
      .insert({
        conversa_id: conversationId,
        remetente_id: user.id,
        remetente_nome: userName,
        remetente_tipo: userRole,
        conteudo: content.trim(),
        tipo_mensagem: type,
        anexo_url: attachmentUrl,
        anexo_nome: attachmentName,
        lida: false
      })
      .select()
      .single()

    if (messageError) {
      console.error('Erro ao criar mensagem:', messageError)
      return NextResponse.json(
        { error: 'Erro ao enviar mensagem' },
        { status: 500 }
      )
    }

    // Atualizar conversa
    await supabase
      .from('conversas')
      .update({
        ultima_mensagem: content.trim(),
        ultima_mensagem_em: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    return NextResponse.json({
      message,
      success: true
    })

  } catch (error) {
    console.error('Erro no endpoint de mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}