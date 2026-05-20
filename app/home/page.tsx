'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/hooks/useAuthState'
import { chatService } from '@/services/chatService'
import { formatChatTime } from '@/utils/dateFormatter'
import { userService } from '@/services/userService'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuthState()
  const [loading, setLoading] = useState(true)
  const [localConversations, setLocalConversations] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      if (!authLoading) {
        router.push('/login')
      }
      return
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const unsubscribe = chatService.subscribeToConversations(user.id, async (convs) => {
      const enhanced = await Promise.all(
        convs.map(async (conv) => {
          const otherId = conv.participants.find((id) => id !== user.id)
          if (!otherId) return conv

          try {
            const otherUser = await userService.getUser(otherId)
            return { ...conv, otherUser }
          } catch {
            return conv
          }
        })
      )
      setLocalConversations(enhanced)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  if (authLoading || (loading && localConversations.length === 0)) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
        <Navbar title="ChatSphere" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading chats...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
      <Navbar
        title="ChatSphere"
        rightAction={
          <div className="flex gap-2">
            <Link
              href="/search"
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              title="Search users"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              href="/profile"
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              title="View profile"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {localConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 dark:text-dark-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Search for users to start chatting</p>
              <Link
                href="/search"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Find Users
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-dark-700">
            {localConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors cursor-pointer flex items-center gap-3"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {conv.otherUser?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black dark:text-white truncate">
                    {conv.otherUser?.username || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatChatTime(new Date(conv.lastMessageTime))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Settings */}
      <div className="border-t border-gray-200 dark:border-dark-700 p-4">
        <Link
          href="/settings"
          className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 text-black dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors text-center text-sm font-medium"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}
