import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be at most 30 characters'),
  caption: z.string().max(150, 'Caption must be at most 150 characters').optional().default(''),
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
})

export const searchSchema = z.object({
  query: z.string().email('Please enter a valid email address'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type MessageFormData = z.infer<typeof messageSchema>
export type SearchFormData = z.infer<typeof searchSchema>
