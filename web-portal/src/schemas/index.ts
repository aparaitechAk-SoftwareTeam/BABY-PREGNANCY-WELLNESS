import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'support', 'user']),
});

export const contentArticleSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.string().min(2, 'Category is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  week: z.number().int().min(1).max(42).optional(),
});

export const ticketReplySchema = z.object({
  message: z.string().min(2, 'Message cannot be empty'),
  internalNote: z.boolean().default(false),
});
