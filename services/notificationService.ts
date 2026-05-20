import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export const notificationService = {
  async requestPermission(): Promise<string | null> {
    if (!messaging) {
      console.log('Messaging not supported in this browser')
      return null
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        })
        return token
      }
      return null
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return null
    }
  },

  async saveFCMToken(userId: string, token: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmToken: token,
      })
    } catch (error) {
      console.error('Failed to save FCM token:', error)
    }
  },

  setupMessageListener(onMessageReceived: (payload: any) => void): () => void {
    if (!messaging) {
      return () => {}
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      onMessageReceived(payload)

      if (payload.notification) {
        new Notification(payload.notification.title || 'New Message', {
          body: payload.notification.body || 'You have a new message',
          icon: '/icon.png',
          badge: '/badge.png',
        })
      }
    })

    return unsubscribe
  },

  async checkNotificationSupport(): Promise<boolean> {
    if (!messaging) {
      return false
    }

    try {
      const permission = Notification.permission
      return permission === 'granted' || permission === 'default'
    } catch {
      return false
    }
  },
}
