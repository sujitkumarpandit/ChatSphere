'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { messageSchema, MessageFormData } from '@/utils/validators'
import { useAuthState } from '@/hooks/useAuthState'
import { useChat } from '@/store/chatStore'
import { chatService } from '@/services/chatService'
import { userService } from '@/services/userService'
import { encryptMessage, decryptMessage } from '@/lib/encryption'
import ChatMessage from '@/components/ChatMessage'
import Navbar from '@/components/Navbar'

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuthState()
  const { messages, setMessages } = useChat()
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  })

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Load conversation
  useEffect(() => {
    if (!user || !conversationId) return

    let unsubscribe: (() => void) | null = null

    const loadConversation = async () => {
      try {
        // Get other user ID from conversation
        const parts = conversationId.split('_')
        const otherUserId = parts[0] === user.id ? parts[1] : parts[0]

        // Fetch other user
        const other = await userService.getUser(otherUserId)
        if (other) {
          setOtherUser(other)
        }

        // Load messages
        unsubscribe = chatService.subscribeToMessages(conversationId, (msgs) => {
          setMessages(msgs)
          setLoading(false)
        })
      } catch (err) {
        console.error('Failed to load conversation:', err)
        setLoading(false)
      }
    }

    loadConversation()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user, conversationId, setMessages])

  const onSubmit = async (data: MessageFormData) => {
    if (!user || !otherUser) return

    try {
      // Get encryption keys
      const myPrivateKey = localStorage.getItem(`privkey_${user.id}`)
      if (!myPrivateKey) {
        console.error('Private key not found')
        return
      }

      // Encrypt message
      const encryptedContent = encryptMessage(data.content, otherUser.publicKey, myPrivateKey)

      // Send message
      await chatService.sendMessage(
        conversationId,
        user.id,
        user.username,
        encryptedContent
      )

      reset()
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  if (authLoading || loading || !otherUser) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
        <Navbar title="Chat" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
      {/* Header */}
      <Navbar
        title={otherUser.username}
        showBackButton
        rightAction={
          <div className="flex items-center gap-2">
            {otherUser.isOnline && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                Online
              </span>
            )}
          </div>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 dark:text-dark-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isSent = msg.senderId === user?.id
              let decryptedContent = '[Unable to decrypt]'

              try {
                if (isSent) {
                  // For sent messages, we'd need to decrypt with recipient's key
                  decryptedContent = msg.encryptedContent
                } else {
                  const myPrivateKey = localStorage.getItem(`privkey_${user?.id}`)
                  if (myPrivateKey) {
                    decryptedContent = decryptMessage(msg.encryptedContent, otherUser.publicKey, myPrivateKey)
                  }
                }
              } catch (err) {
                console.error('Decryption error:', err)
              }

              return (
                <ChatMessage
                  key={msg.id}
                  content={decryptedContent}
                  timestamp={msg.timestamp}
                  isSent={isSent}
                  status={msg.status}
                />
              )
            })}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-dark-700 p-4 bg-white dark:bg-dark-800">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="input-field flex-1"
            autoComplete="off"
            {...register('content')}
          />
          <button type="submit" className="btn-primary px-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
            </svg>
          </button>
        </form>
        {errors.content && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
        )}
      </div>
    </div>
  )
}
