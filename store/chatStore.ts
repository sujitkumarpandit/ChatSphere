import { create } from 'zustand'
import { Conversation, Message, ChatState } from '@/types/chat'

interface ChatStore extends ChatState {
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, conversation: Partial<Conversation>) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  addMessage: (message: Message) => void
  updateMessage: (id: string, message: Partial<Message>) => void
  setMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearChat: () => void
}

export const useChat = create<ChatStore>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  setCurrentConversation: (conversation) =>
    set({
      currentConversation: conversation,
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  setMessages: (messages) =>
    set({
      messages,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  clearChat: () =>
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      loading: false,
      error: null,
    }),
}))
