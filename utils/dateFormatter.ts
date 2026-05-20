import { format, isToday, isYesterday, differenceInMinutes, differenceInHours } from 'date-fns'

export function formatMessageTime(date: Date): string {
  const now = new Date()
  const diffMinutes = differenceInMinutes(now, date)
  const diffHours = differenceInHours(now, date)

  if (diffMinutes < 1) return 'now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'yesterday'

  return format(date, 'dd/MM/yyyy')
}

export function formatChatTime(date: Date): string {
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'yesterday'
  return format(date, 'dd/MM/yy')
}

export function formatFullDate(date: Date): string {
  return format(date, 'PPP p')
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}
