import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters long.").max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, and use hyphens for spaces."),
  description: z.string().min(10, "Description must be at least 10 characters long.").optional(),
  imageUrl: z.string().url("Invalid image URL.").optional(),
  parentId: z.string().cuid().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters long.").max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, and use hyphens for spaces.").optional(),
  description: z.string().min(10, "Description must be at least 10 characters long.").optional(),
  imageUrl: z.string().url("Invalid image URL.").optional(),
  parentId: z.string().cuid().optional(),
})
