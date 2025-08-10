'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useChat, ChatConversation } from '@/hooks/use-chat'
import { useAuthSelectors } from '@/stores/auth-store'
import { 
  MessageCircle, 
  Search, 
  Plus, 
  MoreVertical,
  Users,
  Clock,
  CheckCheck,
  Check
} from 'lucide-react'

interface ChatListProps {
  onSelectConversation: (conversation: ChatConversation) => void
  selectedConversationId?: string
  compact?: boolean
}

export function ChatList({ 
  onSelectConversation, 
  selectedConversationId, 
  compact = false 
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuthSelectors()
  const { 
    conversations, 
    isLoading, 
    fetchConversations,
    getTotalUnreadCount 
  } = useChat()

  const filteredConversations = conversations.filter(conv =>
    conv.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participantes_nomes.some(nome => 
      nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      })
    }
  }

  const getParticipantNames = (conversation: ChatConversation) => {
    return conversation.participantes_nomes
      .filter((_, index) => conversation.participantes[index] !== user?.id)
      .join(', ')
  }

  const getConversationIcon = (conversation: ChatConversation) => {
    if (conversation.participantes.length > 2) {
      return <Users className="h-5 w-5" />
    }
    return <MessageCircle className="h-5 w-5" />
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversas
              {getTotalUnreadCount() > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {getTotalUnreadCount()}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={fetchConversations}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de Conversas */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">
                {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm 
                  ? 'Tente buscar por outro termo'
                  : 'Suas conversas aparecerão aqui'
                }
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversationId === conversation.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getConversationIcon(conversation)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {compact ? conversation.titulo : getParticipantNames(conversation)}
                      </h4>
                      <div className="flex items-center gap-1">
                        {conversation.ultima_mensagem_em && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.ultima_mensagem_em)}
                          </span>
                        )}
                        {conversation.mensagens_nao_lidas > 0 && (
                          <Badge variant="destructive" className="text-xs h-5 w-5 p-0 flex items-center justify-center">
                            {conversation.mensagens_nao_lidas > 9 ? '9+' : conversation.mensagens_nao_lidas}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {conversation.ultima_mensagem && (
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.ultima_mensagem}
                      </p>
                    )}
                    
                    {conversation.pedido_id && (
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Pedido
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status de Conexão */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Online</span>
            <Clock className="h-3 w-3 ml-2" />
            <span>Última atualização: agora</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}