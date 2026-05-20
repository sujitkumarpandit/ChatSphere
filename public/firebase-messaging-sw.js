// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

// Import Firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js')

// Initialize Firebase with config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}

firebase.initializeApp(firebaseConfig)

// Retrieve Firebase Messaging object
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)

  const notificationTitle = payload.notification.title || 'New Message'
  const notificationOptions = {
    body: payload.notification.body || 'You have a new message',
    icon: '/icon.png',
    badge: '/badge.png',
    tag: 'chatsphere-notification',
    requireInteraction: false,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  // Open app or focus window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
