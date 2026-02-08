import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  name: z.string().min(2, "Name must be at least 2 characters long.").optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER).optional(),
})

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address.").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long.").optional(),
  name: z.string().min(2, "Name must be at least 2 characters long.").optional(),
  phone: z.string().optional(),
  emailVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  twoFactorSecret: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
  role: z.nativeEnum(UserRole).optional(),
})
