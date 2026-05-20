import { useEffect } from 'react'
import { useAuth } from '@/store/authStore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { userService } from '@/services/userService'

export function useAuthState() {
  const { user, loading, error, isAuthenticated, setUser, setLoading, setError } = useAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await userService.getUser(firebaseUser.uid)
          if (userData) {
            setUser(userData)
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [setUser, setLoading, setError])

  return { user, loading, error, isAuthenticated }
}
