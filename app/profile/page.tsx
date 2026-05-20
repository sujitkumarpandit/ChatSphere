'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, ProfileFormData } from '@/utils/validators'
import { useAuthState } from '@/hooks/useAuthState'
import { useAuth } from '@/store/authStore'
import { userService } from '@/services/userService'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuthState()
  const { setUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login')
      return
    }

    if (user) {
      setValue('username', user.username)
      setValue('caption', user.caption)
    }
  }, [user, isAuthenticated, authLoading, router, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await userService.updateUserProfile(user.id, {
        username: data.username,
        caption: data.caption,
      })

      // Update local state
      const updatedUser = { ...user, username: data.username, caption: data.caption || '' }
      setUser(updatedUser)

      setSuccess('Profile updated successfully')
      setEditing(false)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
        <Navbar title="Profile" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-dark-900">
      <Navbar title="Profile" showBackButton />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md">
          {/* Avatar */}
          <div className="card text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
              {user.username[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white">{user.username}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="input-field"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Caption / Bio (optional)
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  {...register('caption')}
                />
                {errors.caption && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.caption.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Username</p>
                <p className="font-medium text-black dark:text-white">{user.username}</p>
              </div>

              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bio</p>
                <p className="font-medium text-black dark:text-white">
                  {user.caption || <span className="text-gray-400">No bio yet</span>}
                </p>
              </div>

              <button onClick={() => setEditing(true)} className="btn-primary w-full">
                Edit Profile
              </button>
            </div>
          )}

          {/* Account Info */}
          <div className="card mt-6 bg-gray-50 dark:bg-dark-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Joined</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
