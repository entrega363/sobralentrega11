import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar conversas do usuário
    const { data: conversations, error } = await supabase
      .from('conversas')
      .select(`
        *,
        mensagens!inner(
          id,
          conteudo,
          created_at,
          lida,
          remetente_id
        )
      `)
      .contains('participantes', [user.id])
      .eq('ativa', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar conversas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar conversas' },
        { status: 500 }
      )
    }

    // Processar conversas e contar mensagens não lidas
    const processedConversations = conversations?.map(conv => ({
      ...conv,
      mensagens_nao_lidas: conv.mensagens?.filter(
        (msg: any) => !msg.lida && msg.remetente_id !== user.id
      ).length || 0,
      ultima_mensagem: conv.mensagens?.[0]?.conteudo || '',
      ultima_mensagem_em: conv.mensagens?.[0]?.created_at || conv.created_at
    })) || []

    return NextResponse.json({
      conversations: processedConversations
    })

  } catch (error) {
    console.error('Erro no endpoint de conversas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      participantIds,
      participantNames,
      participantTypes,
      title,
      pedidoId
    } = await request.json()

    if (!participantIds || !participantNames || !title) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
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

    // Buscar dados do usuário atual
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, role')
      .eq('id', user.id)
      .single()

    const userName = profile?.nome || user.email || 'Usuário'
    const userRole = profile?.role || 'consumidor'

    // Verificar se já existe uma conversa com os mesmos participantes
    const allParticipants = [user.id, ...participantIds].sort()
    
    const { data: existingConv } = await supabase
      .from('conversas')
      .select('id')
      .eq('ativa', true)
      .filter('participantes', 'eq', `{${allParticipants.join(',')}}`)
      .single()

    if (existingConv) {
      return NextResponse.json({
        conversation: { id: existingConv.id },
        message: 'Conversa já existe'
      })
    }

    // Criar nova conversa
    const allNames = [userName, ...participantNames]
    const allTypes = [userRole, ...participantTypes]

    const { data: conversation, error: convError } = await supabase
      .from('conversas')
      .insert({
        pedido_id: pedidoId,
        participantes: allParticipants,
        participantes_nomes: allNames,
        participantes_tipos: allTypes,
        titulo: title,
        ativa: true
      })
      .select()
      .single()

    if (convError) {
      console.error('Erro ao criar conversa:', convError)
      return NextResponse.json(
        { error: 'Erro ao criar conversa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversation,
      message: 'Conversa criada com sucesso'
    })

  } catch (error) {
    console.error('Erro no endpoint de conversas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}