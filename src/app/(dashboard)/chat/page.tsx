'use client'

import { useState } from 'react'
import { ChatList } from '@/components/chat/chat-list'
import { ChatWindow } from '@/components/chat/chat-window'
import { ChatConversation } from '@/hooks/use-chat'

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4">
      {/* Lista de Conversas */}
      <div className="w-1/3 min-w-[300px]">
        <ChatList
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>

      {/* Janela de Chat */}
      <div className="flex-1">
        <ChatWindow
          conversation={selectedConversation || undefined}
          onClose={() => setSelectedConversation(null)}
        />
      </div>
    </div>
  )
}