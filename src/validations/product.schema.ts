import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  price: z.number().positive(),
  sku: z.string().min(3),
  stockQuantity: z.number().int().min(0),
  categoryId: z.string().cuid(),
  // ... other fields
})
