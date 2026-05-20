export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderUsername: string
  encryptedContent: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'seen'
}

export interface Conversation {
  id: string
  participants: string[]
  participantIds: { [key: string]: string }
  lastMessage: string
  lastMessageTime: Date
  createdAt: Date
  unreadCount: number
}

export interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  loading: boolean
  error: string | null
}
