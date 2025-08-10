'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthSelectors } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface ChatMessage {
  id: string
  conversa_id: string
  remetente_id: string
  remetente_nome: string
  remetente_tipo: 'consumidor' | 'empresa' | 'entregador' | 'admin'
  conteudo: string
  tipo_mensagem: 'texto' | 'imagem' | 'arquivo' | 'localizacao'
  anexo_url?: string
  anexo_nome?: string
  lida: boolean
  created_at: string
  updated_at: string
}

export interface ChatConversation {
  id: string
  pedido_id?: string
  participantes: string[]
  participantes_nomes: string[]
  participantes_tipos: string[]
  titulo: string
  ultima_mensagem?: string
  ultima_mensagem_em?: string
  mensagens_nao_lidas: number
  ativa: boolean
  created_at: string
  updated_at: string
}

export function useChat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuthSelectors()
  const supabase = createClient()

  // Conectar ao canal de tempo real
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `conversa_id=in.(${conversations.map(c => c.id).join(',')})`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          
          // Adicionar nova mensagem se for da conversa ativa
          if (newMessage.conversa_id === activeConversation) {
            setMessages(prev => [...prev, newMessage])
            
            // Marcar como lida se não for do usuário atual
            if (newMessage.remetente_id !== user.id) {
              markMessageAsRead(newMessage.id)
            }
          }
          
          // Atualizar lista de conversas
          updateConversationLastMessage(newMessage)
          
          // Mostrar notificação se não for do usuário atual
          if (newMessage.remetente_id !== user.id) {
            toast({
              title: `Nova mensagem de ${newMessage.remetente_nome}`,
              description: newMessage.conteudo.substring(0, 50) + '...'
            })
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, conversations, activeConversation])

  const fetchConversations = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
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

      if (error) throw error

      // Processar conversas e contar mensagens não lidas
      const processedConversations = data?.map(conv => ({
        ...conv,
        mensagens_nao_lidas: conv.mensagens?.filter(
          (msg: any) => !msg.lida && msg.remetente_id !== user.id
        ).length || 0,
        ultima_mensagem: conv.mensagens?.[0]?.conteudo || '',
        ultima_mensagem_em: conv.mensagens?.[0]?.created_at || conv.created_at
      })) || []

      setConversations(processedConversations)
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as conversas',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('conversa_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
      setActiveConversation(conversationId)

      // Marcar mensagens como lidas
      const unreadMessages = data?.filter(msg => 
        !msg.lida && msg.remetente_id !== user?.id
      ) || []

      if (unreadMessages.length > 0) {
        await markMessagesAsRead(unreadMessages.map(msg => msg.id))
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mensagens',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    type: 'texto' | 'imagem' | 'arquivo' | 'localizacao' = 'texto',
    attachmentUrl?: string,
    attachmentName?: string
  ) => {
    if (!user || !content.trim()) return false

    try {
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversationId,
          remetente_id: user.id,
          remetente_nome: user.user_metadata?.nome || user.email,
          remetente_tipo: user.user_metadata?.role || 'consumidor',
          conteudo: content.trim(),
          tipo_mensagem: type,
          anexo_url: attachmentUrl,
          anexo_nome: attachmentName,
          lida: false
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar conversa
      await supabase
        .from('conversas')
        .update({
          ultima_mensagem: content.trim(),
          ultima_mensagem_em: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive'
      })
      return false
    }
  }, [user, supabase])

  const createConversation = useCallback(async (
    participantIds: string[],
    participantNames: string[],
    participantTypes: string[],
    title: string,
    pedidoId?: string
  ) => {
    if (!user) return null

    try {
      const allParticipants = [user.id, ...participantIds]
      const allNames = [user.user_metadata?.nome || user.email, ...participantNames]
      const allTypes = [user.user_metadata?.role || 'consumidor', ...participantTypes]

      const { data, error } = await supabase
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

      if (error) throw error

      // Atualizar lista de conversas
      await fetchConversations()

      return data.id
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a conversa',
        variant: 'destructive'
      })
      return null
    }
  }, [user, supabase, fetchConversations])

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await supabase
        .from('mensagens')
        .update({ lida: true })
        .eq('id', messageId)
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error)
    }
  }, [supabase])

  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    try {
      await supabase
        .from('mensagens')
        .update({ lida: true })
        .in('id', messageIds)
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error)
    }
  }, [supabase])

  const updateConversationLastMessage = useCallback((message: ChatMessage) => {
    setConversations(prev => prev.map(conv => 
      conv.id === message.conversa_id
        ? {
            ...conv,
            ultima_mensagem: message.conteudo,
            ultima_mensagem_em: message.created_at,
            mensagens_nao_lidas: message.remetente_id !== user?.id 
              ? conv.mensagens_nao_lidas + 1 
              : conv.mensagens_nao_lidas
          }
        : conv
    ))
  }, [user])

  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conv) => total + conv.mensagens_nao_lidas, 0)
  }, [conversations])

  const getConversationForPedido = useCallback((pedidoId: string) => {
    return conversations.find(conv => conv.pedido_id === pedidoId)
  }, [conversations])

  // Carregar conversas ao montar o componente
  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user, fetchConversations])

  return {
    conversations,
    messages,
    activeConversation,
    isLoading,
    isConnected,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markMessageAsRead,
    markMessagesAsRead,
    getTotalUnreadCount,
    getConversationForPedido,
    setActiveConversation
  }
}