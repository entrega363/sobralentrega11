'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useChat, ChatMessage, ChatConversation } from '@/hooks/use-chat'
import { useAuthSelectors } from '@/stores/auth-store'
import { 
  MessageCircle, 
  Send, 
  Phone, 
  MoreVertical, 
  Paperclip,
  Smile,
  MapPin,
  Image,
  File,
  Check,
  CheckCheck
} from 'lucide-react'

interface ChatWindowProps {
  conversation?: ChatConversation
  onClose?: () => void
  compact?: boolean
}

export function ChatWindow({ conversation, onClose, compact = false }: ChatWindowProps) {
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthSelectors()
  const { 
    messages, 
    sendMessage, 
    fetchMessages, 
    isLoading,
    isConnected 
  } = useChat()

  // Carregar mensagens quando a conversa mudar
  useEffect(() => {
    if (conversation?.id) {
      fetchMessages(conversation.id)
    }
  }, [conversation?.id, fetchMessages])

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversation?.id) return

    const success = await sendMessage(conversation.id, messageText)
    if (success) {
      setMessageText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  const renderMessage = (message: ChatMessage, index: number) => {
    const isMyMessage = message.remetente_id === user?.id
    const showDate = index === 0 || 
      new Date(messages[index - 1].created_at).toDateString() !== 
      new Date(message.created_at).toDateString()

    return (
      <div key={message.id}>
        {showDate && (
          <div className="flex justify-center my-4">
            <Badge variant="secondary" className="text-xs">
              {formatDate(message.created_at)}
            </Badge>
          </div>
        )}
        
        <div className={`flex mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isMyMessage 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-900'
          }`}>
            {!isMyMessage && (
              <div className="text-xs font-medium mb-1 opacity-75">
                {message.remetente_nome}
              </div>
            )}
            
            <div className="break-words">
              {message.tipo_mensagem === 'texto' && message.conteudo}
              
              {message.tipo_mensagem === 'imagem' && (
                <div>
                  <img 
                    src={message.anexo_url} 
                    alt="Imagem enviada"
                    className="max-w-full rounded mb-2"
                  />
                  {message.conteudo && <p>{message.conteudo}</p>}
                </div>
              )}
              
              {message.tipo_mensagem === 'arquivo' && (
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm">{message.anexo_nome}</span>
                </div>
              )}
              
              {message.tipo_mensagem === 'localizacao' && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Localização compartilhada</span>
                </div>
              )}
            </div>
            
            <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
              isMyMessage ? 'text-blue-100' : 'text-gray-500'
            }`}>
              <span>{formatTime(message.created_at)}</span>
              {isMyMessage && (
                message.lida ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Selecione uma conversa
            </h3>
            <p className="text-gray-600">
              Escolha uma conversa para começar a trocar mensagens
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{conversation.titulo}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              {isConnected ? 'Online' : 'Desconectado'}
              {conversation.participantes.length > 2 && (
                <span>• {conversation.participantes.length} participantes</span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <MoreVertical className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button size="sm" variant="outline" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Nenhuma mensagem ainda</p>
              <p className="text-sm text-gray-500">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        {isTyping && (
          <div className="text-sm text-gray-500 mb-2">
            Alguém está digitando...
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            size="sm"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Button size="sm" variant="ghost" className="text-xs">
            <Image className="h-3 w-3 mr-1" />
            Foto
          </Button>
          <Button size="sm" variant="ghost" className="text-xs">
            <File className="h-3 w-3 mr-1" />
            Arquivo
          </Button>
          <Button size="sm" variant="ghost" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Localização
          </Button>
        </div>
      </div>
    </Card>
  )
}