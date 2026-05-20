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

function generateConversationId(
  userId1: string,
  userId2: string
): string {
  return [userId1, userId2].sort().join('_')
}

export const chatService = {
  // CREATE OR GET CONVERSATION
  async getOrCreateConversation(
    currentUserId: string,
    otherUserId: string
  ): Promise<Conversation> {
    const conversationId = generateConversationId(
      currentUserId,
      otherUserId
    )

    const conversationRef = doc(
      conversationsCollection,
      conversationId
    )

    const docSnap = await getDoc(conversationRef)

    // EXISTING CONVERSATION
    if (docSnap.exists()) {
      const data = docSnap.data()

      return {
        id: docSnap.id,
        participants: data.participants || [],
        participantIds: data.participantIds || {},
        lastMessage: data.lastMessage || '',
        lastMessageTime:
          data.lastMessageTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        unreadCount: data.unreadCount || 0,
      }
    }

    // CREATE NEW CONVERSATION
    const conversationData = {
      participants: [currentUserId, otherUserId],

      participantIds: {
        [currentUserId]: currentUserId,
        [otherUserId]: otherUserId,
      },

      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      unreadCount: 0,
    }

    await setDoc(conversationRef, conversationData)

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

  // SEND MESSAGE
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderUsername: string,
    encryptedContent: string
  ): Promise<string> {
    try {
      // SAVE MESSAGE INSIDE CONVERSATION SUBCOLLECTION
      const messagesRef = collection(
        db,
        'conversations',
        conversationId,
        'messages'
      )

      const messageData = {
        conversationId,
        senderId,
        senderUsername,
        encryptedContent,

        createdAt: serverTimestamp(),

        status: 'sent',
      }

      const docRef = await addDoc(
        messagesRef,
        messageData
      )

      // UPDATE LAST MESSAGE
      await updateDoc(
        doc(conversationsCollection, conversationId),
        {
          lastMessage: encryptedContent,
          lastMessageTime: serverTimestamp(),
        }
      )

      return docRef.id
    } catch (error) {
      console.error('Send message error:', error)
      throw error
    }
  },

  // GET MESSAGES
  async getMessages(
    conversationId: string,
    limitCount: number = 50
  ): Promise<Message[]> {
    try {
      const messagesRef = collection(
        db,
        'conversations',
        conversationId,
        'messages'
      )

      const q = query(
        messagesRef,
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()

        return {
          id: doc.id,
          conversationId,

          senderId: data.senderId,
          senderUsername: data.senderUsername,

          encryptedContent: data.encryptedContent,

          timestamp:
            data.createdAt?.toDate() || new Date(),

          status: data.status || 'sent',
        }
      })
    } catch (error) {
      console.error('Get messages error:', error)
      return []
    }
  },

  // REALTIME MESSAGE SUBSCRIPTION
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    limitCount: number = 50
  ): () => void {
    const messagesRef = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    )

    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc'),
      limit(limitCount)
    )

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const messages: Message[] =
          querySnapshot.docs.map((doc) => {
            const data = doc.data()

            return {
              id: doc.id,
              conversationId,

              senderId: data.senderId,
              senderUsername: data.senderUsername,

              encryptedContent:
                data.encryptedContent,

              timestamp:
                data.createdAt?.toDate() ||
                new Date(),

              status: data.status || 'sent',
            }
          })

        callback(messages)
      },
      (error) => {
        console.error(
          'Realtime messages error:',
          error
        )
      }
    )

    return unsubscribe
  },

  // UPDATE MESSAGE STATUS
  async updateMessageStatus(
    conversationId: string,
    messageId: string,
    status: 'delivered' | 'seen'
  ): Promise<void> {
    try {
      await updateDoc(
        doc(
          db,
          'conversations',
          conversationId,
          'messages',
          messageId
        ),
        {
          status,
        }
      )
    } catch (error) {
      console.error(
        'Update message status error:',
        error
      )
    }
  },

  // GET USER CONVERSATIONS
  async getUserConversations(
    userId: string
  ): Promise<Conversation[]> {
    try {
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

          participants: data.participants || [],
          participantIds: data.participantIds || {},

          lastMessage: data.lastMessage || '',

          lastMessageTime:
            data.lastMessageTime?.toDate() ||
            new Date(),

          createdAt:
            data.createdAt?.toDate() ||
            new Date(),

          unreadCount: data.unreadCount || 0,
        }
      })
    } catch (error) {
      console.error(
        'Get conversations error:',
        error
      )

      return []
    }
  },

  // REALTIME CONVERSATIONS
  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      conversationsCollection,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const conversations: Conversation[] =
          querySnapshot.docs.map((doc) => {
            const data = doc.data()

            return {
              id: doc.id,

              participants:
                data.participants || [],

              participantIds:
                data.participantIds || {},

              lastMessage:
                data.lastMessage || '',

              lastMessageTime:
                data.lastMessageTime?.toDate() ||
                new Date(),

              createdAt:
                data.createdAt?.toDate() ||
                new Date(),

              unreadCount:
                data.unreadCount || 0,
            }
          })

        callback(conversations)
      },
      (error) => {
        console.error(
          'Realtime conversations error:',
          error
        )
      }
    )

    return unsubscribe
  },
}