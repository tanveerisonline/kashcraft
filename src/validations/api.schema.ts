import { z } from "zod";

// ============ SEARCH VALIDATION ============
export const searchFilterSchema = z.object({
  field: z.string(),
  values: z.union([z.array(z.string()), z.object({ min: z.number().optional(), max: z.number().optional() })]),
  operator: z.enum(["AND", "OR"]).optional(),
});

export const searchProductsSchema = z.object({
  query: z.string().min(1).max(200),
  filters: z.array(searchFilterSchema).optional(),
  sortBy: z
    .enum(["relevance", "price_asc", "price_desc", "newest", "rating", "popular"])
    .optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  userId: z.string().optional(),
});

export const searchSuggestionsSchema = z.object({
  q: z.string().min(1).max(100),
});

// ============ LOYALTY VALIDATION ============
export const loyaltyRedeemSchema = z.object({
  action: z.enum(["redeem"]),
  points: z.number().int().positive(),
});

// ============ GIFT CARDS VALIDATION ============
export const giftCardValidateSchema = z.object({
  code: z.string().min(1),
  action: z.literal("validate"),
});

export const giftCardRedeemSchema = z.object({
  code: z.string().min(1),
  action: z.literal("redeem"),
  orderId: z.string(),
  amount: z.number().positive(),
});

// ============ ORDERS VALIDATION ============
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(5).max(500),
});

// ============ QUICK CHECKOUT VALIDATION ============
export const quickCheckoutSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  paymentMethodId: z.string(),
  shippingAddressId: z.string(),
  billingAddressId: z.string().optional(),
  currencyCode: z.string().length(3).optional(),
});

export const savePaymentMethodSchema = z.object({
  type: z.enum(["credit_card", "paypal", "apple_pay", "google_pay"]),
  token: z.string(),
  last4: z.string().length(4),
  cardholderName: z.string(),
  isDefault: z.boolean().optional(),
});

export const saveAddressSchema = z.object({
  type: z.enum(["shipping", "billing"]),
  label: z.string().max(50),
  fullName: z.string().min(1),
  streetAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
});

// ============ REVIEWS VALIDATION ============
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(2000),
  verified: z.boolean().optional(),
});

// ============ WISHLIST VALIDATION ============
export const wishlistActionSchema = z.object({
  productId: z.string(),
  action: z.enum(["add", "remove"]),
});

// ============ CART VALIDATION ============
export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const updateCartSchema = z.object({
  items: z.array(cartItemSchema),
});

// ============ PRODUCT COMPARISON VALIDATION ============
export const compareProductsSchema = z.object({
  productIds: z.array(z.string()).min(2).max(4),
});

// ============ PRODUCT WAITLIST VALIDATION ============
export const joinWaitlistSchema = z.object({
  productId: z.string(),
  email: z.string().email(),
});

// ============ VOUCHER VALIDATION ============
export const voucharValidateSchema = z.object({
  code: z.string().min(1),
});

// ============ CURRENCY VALIDATION ============
export const currencyDetectSchema = z.object({
  ip: z.string().ip({ version: "v4" }).optional(),
});

export const currencyConvertSchema = z.object({
  amount: z.number().positive(),
  from: z.string().length(3),
  to: z.string().length(3),
});

// ============ TRACKING VALIDATION ============
export const trackingSchema = z.object({
  trackingNumber: z.string().min(1),
});

// ============ BLOG VALIDATION ============
export const createBlogPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50),
  excerpt: z.string().min(10).max(300),
  author: z.string(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().url().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const getBlogPostSchema = z.object({
  slug: z.string().min(1),
});

// ============ RECOMMENDATIONS VALIDATION ============
export const recommendationSchema = z.object({
  productId: z.string().optional(),
  type: z.enum(["frequently_bought", "related", "similar", "trending", "personalized"]),
  limit: z.number().int().positive().max(20).default(5),
  userId: z.string().optional(),
});

// ============ MARKETING VALIDATION ============
export const newsletterSubscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
});

// ============ INVENTORY VALIDATION ============
export const inventoryStockSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(0),
  reason: z.enum(["sale", "return", "restock", "adjustment", "damage"]),
  notes: z.string().optional(),
});

// ============ TYPE EXPORTS ============
export type SearchProductsInput = z.infer<typeof searchProductsSchema>;
export type SearchSuggestionsInput = z.infer<typeof searchSuggestionsSchema>;
export type LoyaltyRedeemInput = z.infer<typeof loyaltyRedeemSchema>;
export type GiftCardValidateInput = z.infer<typeof giftCardValidateSchema>;
export type GiftCardRedeemInput = z.infer<typeof giftCardRedeemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type QuickCheckoutInput = z.infer<typeof quickCheckoutSchema>;
export type SavePaymentMethodInput = z.infer<typeof savePaymentMethodSchema>;
export type SaveAddressInput = z.infer<typeof saveAddressSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type WishlistActionInput = z.infer<typeof wishlistActionSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type CompareProductsInput = z.infer<typeof compareProductsSchema>;
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type VoucherValidateInput = z.infer<typeof voucharValidateSchema>;
export type CurrencyDetectInput = z.infer<typeof currencyDetectSchema>;
export type CurrencyConvertInput = z.infer<typeof currencyConvertSchema>;
export type TrackingInput = z.infer<typeof trackingSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type GetBlogPostInput = z.infer<typeof getBlogPostSchema>;
export type RecommendationInput = z.infer<typeof recommendationSchema>;
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
export type InventoryStockInput = z.infer<typeof inventoryStockSchema>;
