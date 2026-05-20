import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Conversation, Message } from '@/types/chat'

const conversationsCollection = collection(db, 'conversations')
const messagesCollection = collection(db, 'messages')

function generateConversationId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort()
  return `${sorted[0]}_${sorted[1]}`
}

export const chatService = {
  async getOrCreateConversation(currentUserId: string, otherUserId: string): Promise<Conversation> {
    const conversationId = generateConversationId(currentUserId, otherUserId)
    const docSnap = await getDoc(doc(conversationsCollection, conversationId))

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        participants: data.participants,
        participantIds: data.participantIds,
        lastMessage: data.lastMessage || '',
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        unreadCount: data.unreadCount || 0,
      }
    }

    const now = serverTimestamp()
    const conversationData = {
      participants: [currentUserId, otherUserId],
      participantIds: {
        [currentUserId]: currentUserId,
        [otherUserId]: otherUserId,
      },
      lastMessage: '',
      lastMessageTime: now,
      createdAt: now,
      unreadCount: 0,
    }

    await setDoc(doc(conversationsCollection, conversationId), conversationData)

    return {
      id: conversationId,
      participants: [currentUserId, otherUserId],
      participantIds: {
        [currentUserId]: currentUserId,
        [otherUserId]: otherUserId,
      },
      lastMessage: '',
      lastMessageTime: new Date(),
      createdAt: new Date(),
      unreadCount: 0,
    }
  },

  async sendMessage(conversationId: string, senderId: string, senderUsername: string, encryptedContent: string): Promise<string> {
    const messageData = {
      conversationId,
      senderId,
      senderUsername,
      encryptedContent,
      chatId: conversationId,
      createdAt: serverTimestamp(),
      // Back-compat for any older documents / UI mapping
      timestamp: serverTimestamp(),
      status: 'sent' as const,
    }


    const docRef = await addDoc(messagesCollection, messageData)

    await updateDoc(doc(conversationsCollection, conversationId), {
      lastMessage: '[Encrypted message]',
      lastMessageTime: serverTimestamp(),
    })

    return docRef.id
  },

  async getMessages(conversationId: string, limitCount: number = 50): Promise<Message[]> {
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )


    const querySnapshot = await getDocs(q)
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data()
          return {
            id: doc.id,
            conversationId,
            senderId: data.senderId,
            senderUsername: data.senderUsername,
            encryptedContent: data.encryptedContent,
            timestamp: data.createdAt?.toDate() || data.timestamp?.toDate?.() || new Date(),
            status: data.status || 'sent',
          }

      })
      .reverse()
  },

  subscribeToMessages(

    conversationId: string,
    callback: (messages: Message[]) => void,
    limitCount: number = 50
  ): () => void {
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            conversationId,
            senderId: data.senderId,
            senderUsername: data.senderUsername,
            encryptedContent: data.encryptedContent,
            timestamp: data.createdAt?.toDate() || data.timestamp?.toDate?.() || new Date(),
            status: data.status || 'sent',
          }

        })
        .reverse()

      callback(messages)
    })

    return unsubscribe
  },

  async updateMessageStatus(conversationId: string, messageId: string, status: 'delivered' | 'seen'): Promise<void> {
    await updateDoc(doc(db, `conversations/${conversationId}/messages/${messageId}`), {
      status,
    })
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const q = query(
      conversationsCollection,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        participants: data.participants,
        participantIds: data.participantIds,
        lastMessage: data.lastMessage || '',
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        unreadCount: data.unreadCount || 0,
      }
    })
  },

  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    const q = query(
      conversationsCollection,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversations = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          participants: data.participants,
          participantIds: data.participantIds,
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          unreadCount: data.unreadCount || 0,
        }
      })

      callback(conversations)
    })

    return unsubscribe
  },
}
