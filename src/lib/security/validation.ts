/**
 * Input Validation using Zod
 * Validates data on both frontend and backend
 */

import { z } from "zod";

/**
 * Password validation schema
 * Requirements: 12+ chars, uppercase, lowercase, digit, special char
 */
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/\d/, "Password must contain digit")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain special character");

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email too long")
  .transform((email) => email.toLowerCase());

/**
 * User registration schema
 */
export const userRegistrationSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name too long"),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name too long"),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string(),

    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms",
    }),

    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: "You must accept the privacy policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required"),
  rememberMe: z.boolean().optional(),
});

/**
 * Product review schema
 */
export const productReviewSchema = z.object({
  rating: z.number().min(1, "Rating required").max(5, "Max rating is 5"),
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title too long"),
  content: z.string().min(20, "Review must be at least 20 characters").max(5000, "Review too long"),
  verified: z.boolean().optional(),
});

/**
 * Product update schema (admin)
 */
export const productUpdateSchema = z.object({
  name: z.string().min(2, "Name required").max(200, "Name too long"),
  description: z.string().min(10, "Description too short").max(5000, "Description too long"),
  price: z.number().positive("Price must be positive").safe(),
  categoryId: z.string().uuid("Invalid category"),
  stock: z.number().int("Stock must be integer").min(0, "Stock cannot be negative"),
  sku: z.string().regex(/^[A-Z0-9-]+$/, "Invalid SKU format"),
});

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: z.string().min(5, "Street required").max(100, "Street too long"),
  city: z.string().min(2, "City required").max(100, "City too long"),
  state: z.string().min(2, "State required").max(100, "State too long"),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid postal code"),
  country: z.string().length(2, "Invalid country code"),
  isDefault: z.boolean().optional(),
});

/**
 * Order creation schema
 */
export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Order must contain at least one item"),

  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  couponCode: z.string().max(50, "Coupon code too long").optional(),
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).optional(),
  sortBy: z.string().optional(),
});

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query required").max(200, "Search query too long"),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  ...paginationSchema.shape,
});

/**
 * File upload schema
 */
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File too large (max 10MB)")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Invalid file type"
    ),
  altText: z.string().max(200, "Alt text too long"),
});

/**
 * Validate data against schema
 */
export async function validateSchema<T>(schema: z.ZodSchema<T>, data: any): Promise<T> {
  return await schema.parseAsync(data);
}

/**
 * Validate schema with error handling
 */
export async function validateSchemaWithErrors<T>(
  schema: z.ZodSchema<T>,
  data: any
): Promise<{ success: boolean; data?: T; errors?: Record<string, string> }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: "Validation failed" } };
  }
}

/**
 * Sanitize input before validation
 */
export function sanitizeInput(data: any): any {
  if (typeof data === "string") {
    return data.trim();
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item));
  }

  if (typeof data === "object" && data !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
}

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type ProductReview = z.infer<typeof productReviewSchema>;
export type OrderCreate = z.infer<typeof orderSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
