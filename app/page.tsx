'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/hooks/useAuthState'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuthState()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/home')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-dark-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading ChatSphere...</p>
      </div>
    </div>
  )
}
