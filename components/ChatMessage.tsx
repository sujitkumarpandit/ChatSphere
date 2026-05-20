'use client'

import { formatMessageTime } from '@/utils/dateFormatter'

interface ChatMessageProps {
  content: string
  timestamp: Date
  isSent: boolean
  status?: 'sent' | 'delivered' | 'seen'
}

export default function ChatMessage({ content, timestamp, isSent, status = 'sent' }: ChatMessageProps) {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isSent
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-dark-700 text-black dark:text-white rounded-bl-none'
        }`}
      >
        <p className="break-words text-sm">{content}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs ${isSent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          <span>{formatMessageTime(timestamp)}</span>
          {isSent && (
            <span>
              {status === 'seen' && '✓✓'}
              {status === 'delivered' && '✓✓'}
              {status === 'sent' && '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
