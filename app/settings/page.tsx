'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/authStore'
import { useThemeEffect } from '@/hooks/useThemeEffect'
import { useAuthState } from '@/hooks/useAuthState'
import { userService } from '@/services/userService'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuthState()
  const { logout } = useAuth()
  const { isDark, toggleTheme } = useThemeEffect()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const enabled = localStorage.getItem('notifications-enabled') === 'true'
    setNotificationsEnabled(enabled)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      if (user) {
        await userService.updateUserStatus(user.id, false)
      }
      await signOut(auth)
      logout()
      localStorage.removeItem(`privkey_${user?.id}`)
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
      setLoggingOut(false)
    }
  }

  const handleNotificationToggle = () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(newValue)
    localStorage.setItem('notifications-enabled', String(newValue))
  }

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
        <Navbar title="Settings" showBackButton />
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
      <Navbar title="Settings" showBackButton />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md space-y-4">
          {/* Appearance */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-3">Appearance</h3>

            <div className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM13 11a1 1 0 100-2h-1a1 1 0 100 2h1zm4-4a1 1 0 100-2h-1a1 1 0 100 2h1zM5.464 5.464a1 1 0 01-1.414 0L3.343 4.343a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM5 11a1 1 0 10-2 0v1a1 1 0 102 0v-1zm0-7a1 1 0 100-2V3a1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-black dark:text-white font-medium">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="relative w-12 h-7 bg-gray-300 dark:bg-blue-600 rounded-full transition-colors"
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                    isDark ? 'right-1' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-3">Notifications</h3>

            <div className="card flex items-center justify-between">
              <span className="text-black dark:text-white font-medium">Enable Push Notifications</span>

              <button
                onClick={handleNotificationToggle}
                className="relative w-12 h-7 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors"
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                    notificationsEnabled ? 'right-1 bg-blue-600' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>

            {notificationsEnabled && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You&apos;ll receive notifications for new messages. Messages will not be shown in notifications for privacy.
              </p>
            )}
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-3">Account</h3>

            <div className="card bg-gray-50 dark:bg-dark-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Email</p>
              <p className="font-medium text-black dark:text-white">{user?.email}</p>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-3">About</h3>

            <div className="space-y-3 text-sm">
              <div className="card">
                <p className="text-gray-600 dark:text-gray-400">Version</p>
                <p className="font-medium text-black dark:text-white">1.0.0</p>
              </div>

              <div className="card">
                <p className="text-gray-600 dark:text-gray-400">Privacy & Security</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  All messages are encrypted end-to-end. Your private keys are stored locally on your device.
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  )
}
