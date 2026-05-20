'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { searchSchema, SearchFormData } from '@/utils/validators'
import { userService } from '@/services/userService'
import { chatService } from '@/services/chatService'
import { useAuthState } from '@/hooks/useAuthState'
import Navbar from '@/components/Navbar'
import { User } from '@/types/user'

export default function SearchPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuthState()
  const [searchResult, setSearchResult] = useState<User | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  })

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const onSubmit = async (data: SearchFormData) => {
    if (!user) return

    setSearching(true)
    setError('')
    setSearchResult(null)

    try {
      if (data.query === user.email) {
        setError("You can't message yourself")
        return
      }

      const foundUser = await userService.searchUserByEmail(data.query)

      if (!foundUser) {
        setError('User not found')
        return
      }

      setSearchResult(foundUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const startConversation = async () => {
    if (!user || !searchResult) return

    try {
      const conversation = await chatService.getOrCreateConversation(user.id, searchResult.id)
      router.push(`/chat/${conversation.id}`)
    } catch (err) {
      setError('Failed to start conversation')
    }
  }

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
        <Navbar title="Search Users" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
      <Navbar title="Search Users" showBackButton />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md">
          {/* Search Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Enter email address
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="input-field"
                    {...register('query')}
                  />
                  {errors.query && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.query.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="btn-primary px-6 self-end"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Search Result */}
          {searchResult && (
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {searchResult.username[0].toUpperCase()}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-black dark:text-white">{searchResult.username}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{searchResult.email}</p>
                  {searchResult.caption && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{searchResult.caption}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {searchResult.isOnline ? (
                      <span className="text-green-600 dark:text-green-400">● Online</span>
                    ) : (
                      <span>Last seen {new Date(searchResult.lastSeen).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={startConversation}
                className="mt-4 w-full btn-primary"
              >
                Start Conversation
              </button>
            </div>
          )}

          {/* Help Text */}
          {!searchResult && !searching && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Enter the email address of the person you want to chat with. They must already be signed up on ChatSphere.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
