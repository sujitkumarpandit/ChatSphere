export interface User {
  id: string
  email: string
  username: string
  caption: string
  photoUrl: string
  publicKey: string
  createdAt: Date
  isOnline: boolean
  lastSeen: Date
}

export interface UserProfile extends Omit<User, 'publicKey'> {
}
