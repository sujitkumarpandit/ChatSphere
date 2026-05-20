# ChatSphere - Modern Secure Messaging App

A beautiful, secure, real-time chat application built with Next.js, Firebase, and end-to-end encryption.

## Features

- 🔐 **End-to-End Encrypted Messages** - All messages are encrypted with TweetNaCl.js
- 🔑 **Secure Authentication** - Google OAuth authentication only
- 💬 **Real-time Messaging** - Instant message delivery with Firestore
- 👤 **User Profiles** - Custom username, bio, and profile information
- 🔍 **User Search** - Find users by email address
- 📱 **Mobile Responsive** - Perfect on mobile, tablet, and desktop
- 🌓 **Dark Mode** - Beautiful dark theme support
- 🔔 **Push Notifications** - Firebase Cloud Messaging integration
- ⚡ **Fast & Lightweight** - Optimized performance

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage, Messaging)
- **Encryption**: TweetNaCl.js
- **State Management**: Zustand
- **Form Validation**: React Hook Form + Zod
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Firebase project (free tier)
- Vercel account (for deployment)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CHAT_APP
npm install
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** (Google provider)
4. Create **Firestore Database** (start in test mode)
5. Create **Storage** bucket
6. Enable **Cloud Messaging**

### 3. Get Firebase Credentials

1. Go to Project Settings → Service Accounts
2. Under "Firebase SDK snippet", click "Config"
3. Copy the Firebase config object

### 4. Configure Environment Variables

Create `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ChatSphere
```

#### Getting VAPID Key for Push Notifications

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web Push Certificates", create a new key pair
3. Copy the public key to `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### 5. Deploy Firestore Security Rules

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set your project
firebase use --add

# Deploy rules (copy content from firebase-rules.txt to your Firestore rules)
firebase deploy --only firestore:rules
```

Or manually in Firebase Console:
1. Go to Firestore Database → Rules
2. Copy the rules from `firebase-rules.txt`
3. Publish

### 6. Configure Google OAuth

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Google provider
3. Add authorized domains (your Vercel domain, localhost:3000)

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and login with your Google account.

## Project Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home redirect
├── login/
│   └── page.tsx        # Login page
├── home/
│   └── page.tsx        # Chat list
├── chat/
│   └── [conversationId]/
│       └── page.tsx    # Chat page
├── search/
│   └── page.tsx        # User search
├── profile/
│   └── page.tsx        # User profile
├── settings/
│   └── page.tsx        # Settings
└── globals.css         # Global styles

components/
├── Navbar.tsx          # Navigation bar
├── ChatMessage.tsx     # Message bubble
├── TypingIndicator.tsx # Typing indicator

hooks/
├── useAuthState.ts     # Auth hook
├── useThemeEffect.ts   # Theme hook

lib/
├── firebase.ts         # Firebase config
├── encryption.ts       # E2E encryption

services/
├── userService.ts      # User operations
├── chatService.ts      # Chat operations
├── notificationService.ts

store/
├── authStore.ts        # Auth state
├── chatStore.ts        # Chat state
├── themeStore.ts       # Theme state

types/
├── user.ts             # User types
├── chat.ts             # Chat types

utils/
├── validators.ts       # Form validation
├── dateFormatter.ts    # Date formatting
```

## Firestore Database Schema

```
users/
  {userId}/
    email: string
    username: string
    caption: string
    photoUrl: string
    publicKey: string (for encryption)
    createdAt: timestamp
    isOnline: boolean
    lastSeen: timestamp
    fcmToken: string (for notifications)

conversations/
  {conversationId}/
    participants: array[userId]
    participantIds: object
    lastMessage: string
    lastMessageTime: timestamp
    createdAt: timestamp
    unreadCount: number
    messages/
      {messageId}/
        senderId: string
        senderUsername: string
        encryptedContent: string
        timestamp: timestamp
        status: 'sent' | 'delivered' | 'seen'
```

## Encryption Details

1. **Key Generation**: Each user gets a public/private key pair on signup
2. **Storage**: Public key stored in Firestore, private key in browser localStorage
3. **Message Flow**: 
   - User encrypts message with recipient's public key
   - Encrypted message stored in Firestore
   - Recipient decrypts with their private key

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables from `.env.local`
4. Deploy

### 3. Update Firebase Configuration

1. Add your Vercel domain to Firebase → Authentication → Authorized domains
2. Update `.env.local` with production URL
3. Re-deploy on Vercel

## Security Considerations

- ✅ All messages encrypted end-to-end
- ✅ Firestore security rules restrict unauthorized access
- ✅ Google authentication prevents account takeover
- ✅ Private keys never sent to server
- ✅ HTTPS enforced by Vercel
- ✅ Storage rules limit file size

## Performance Optimization

- Code splitting and lazy loading
- Image optimization
- Memoization of components
- Firestore query optimization
- Minimal bundle size

## Troubleshooting

### Firebase SDK Errors
- Ensure environment variables are set correctly
- Check Firebase project has all required services enabled
- Verify API key is correct

### Authentication Issues
- Clear browser cache and cookies
- Add localhost:3000 to authorized domains
- Check Google provider is enabled

### Message Encryption Fails
- Ensure private keys are stored in localStorage
- Verify public keys are present in user profiles
- Check browser console for detailed errors

### Notifications Not Working
- Check notification permission is granted
- Verify VAPID key is correct
- Ensure service worker is registered

## Future Enhancements

- Group chat support
- Message search
- Message deletion/editing
- Read receipts
- Typing indicators
- Voice messages
- File sharing
- Call integration

## License

MIT License - feel free to use this project commercially

## Support

For issues or questions, please open an issue on GitHub.

---

**ChatSphere** - Secure, Private Messaging for Everyone
