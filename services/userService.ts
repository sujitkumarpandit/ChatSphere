import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User, UserProfile } from '@/types/user'

const usersCollection = collection(db, 'users')

export const userService = {
  async createUser(userId: string, email: string, username: string, publicKey: string): Promise<User> {
    const now = serverTimestamp()
    const userData: any = {
      email,
      username,
      caption: '',
      photoUrl: '',
      publicKey,
      createdAt: now,
      isOnline: true,
      lastSeen: now,
    }

    await setDoc(doc(usersCollection, userId), userData)

    return {
      id: userId,
      email,
      username,
      caption: '',
      photoUrl: '',
      publicKey,
      createdAt: new Date(),
      isOnline: true,
      lastSeen: new Date(),
    }
  },

  async getUser(userId: string): Promise<User | null> {
    const docSnap = await getDoc(doc(usersCollection, userId))

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      email: data.email,
      username: data.username,
      caption: data.caption || '',
      photoUrl: data.photoUrl || '',
      publicKey: data.publicKey,
      createdAt: data.createdAt?.toDate() || new Date(),
      isOnline: data.isOnline || false,
      lastSeen: data.lastSeen?.toDate() || new Date(),
    }
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const updateData: any = {}

    if (updates.username) updateData.username = updates.username
    if (updates.caption !== undefined) updateData.caption = updates.caption
    if (updates.photoUrl) updateData.photoUrl = updates.photoUrl

    await updateDoc(doc(usersCollection, userId), updateData)
  },

  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    await updateDoc(doc(usersCollection, userId), {
      isOnline,
      lastSeen: serverTimestamp(),
    })
  },

  async searchUserByEmail(email: string): Promise<User | null> {
    const q = query(usersCollection, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const data = querySnapshot.docs[0].data()
    return {
      id: querySnapshot.docs[0].id,
      email: data.email,
      username: data.username,
      caption: data.caption || '',
      photoUrl: data.photoUrl || '',
      publicKey: data.publicKey,
      createdAt: data.createdAt?.toDate() || new Date(),
      isOnline: data.isOnline || false,
      lastSeen: data.lastSeen?.toDate() || new Date(),
    }
  },

  async checkUsernameExists(username: string): Promise<boolean> {
    const q = query(usersCollection, where('username', '==', username))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  },
}
