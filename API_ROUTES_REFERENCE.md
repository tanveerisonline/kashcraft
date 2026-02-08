# API Routes Quick Reference

## Phase 9-13 Advanced E-Commerce Features

Complete list of API endpoints needed to expose all services to the frontend.

---

## Overview

**Total Routes:** 45+ endpoints
**Directory:** `src/app/api/`
**Pattern:** RESTful with some RPC-style endpoints for complex operations

---

## 1. INVENTORY API

### Get Stock Level

```
GET /api/v1/inventory/stock
Query: ?productId=xxx&productIds=xxx,yyy,zzz
Response: { stock: 50, reserved: 5, available: 45, isLowStock: false }
```

**File:** `src/app/api/v1/inventory/stock/route.ts`

```typescript
import { realTimeInventoryService } from "@/lib/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const productIds = searchParams.get("productIds")?.split(",");

  if (productId) {
    const stock = await realTimeInventoryService.getStockLevel(productId);
    return Response.json(stock);
  }

  if (productIds) {
    const stocks = await Promise.all(
      productIds.map((id) => realTimeInventoryService.getStockLevel(id))
    );
    return Response.json({ stocks });
  }

  return Response.json({ error: "Missing productId or productIds" }, { status: 400 });
}
```

### Get Low Stock Products

```
GET /api/v1/inventory/low-stock
Response: [{ productId, name, stock, threshold }, ...]
```

**File:** `src/app/api/v1/inventory/low-stock/route.ts`

```typescript
export async function GET() {
  const lowStock = await realTimeInventoryService.getLowStockProducts();
  return Response.json(lowStock);
}
```

### Get Inventory Metrics

```
GET /api/v1/inventory/metrics
Response: { totalStock, averageStock, turnoverRate, ... }
```

---

## 2. SEARCH API

### Search with Filters

```
POST /api/v1/search/products
Body: {
  query: "blue shirt",
  filters: [
    { field: "category", values: ["cat-1"] },
    { field: "price", values: { min: 20, max: 100 } },
    { field: "rating", values: ["4"] }
  ],
  sortBy: "price_asc",
  page: 1,
  limit: 20
}
Response: {
  products: [...],
  total: 150,
  facets: [{ field: "category", values: [...] }, ...],
  page: 1,
  limit: 20
}
```

**File:** `src/app/api/v1/search/products/route.ts`

```typescript
import { advancedSearchService } from "@/lib/services";

export async function POST(request: Request) {
  const body = await request.json();
  const results = await advancedSearchService.search({
    query: body.query,
    filters: body.filters,
    sortBy: body.sortBy,
    page: body.page,
    limit: body.limit,
    userId: body.userId, // For personalization
  });

  return Response.json(results);
}
```

### Get Search Suggestions

```
GET /api/v1/search/suggestions?q=blue
Response: {
  suggestions: ["blue shirt", "blue jeans", "blue shoes", ...],
  products: [{ id, name, image }, ...] // Quick results
}
```

**File:** `src/app/api/v1/search/suggestions/route.ts`

### Get Search History

```
GET /api/v1/search/history
Authorization: Bearer token
Response: [
  { id, query, resultCount, timestamp, convertedToOrder },
  ...
]
```

---

## 3. RECOMMENDATIONS API

### Get Recommendations

```
GET /api/v1/recommendations
Query: ?type=frequent&productId=xxx OR ?type=personalized&userId=xxx
Response: {
  type: "frequent",
  products: [{ id, name, image, price, reason }, ...],
  count: 5
}
```

**File:** `src/app/api/v1/recommendations/route.ts`

```typescript
import { recommendationEngine } from "@/lib/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'frequent', 'similar', 'personalized', 'trending'
  const productId = searchParams.get("productId");
  const userId = searchParams.get("userId");

  let recommendations;

  switch (type) {
    case "frequent":
      recommendations = await recommendationEngine.getFrequentlyBoughtTogether(productId);
      break;
    case "similar":
      recommendations = await recommendationEngine.getSimilarProducts(productId);
      break;
    case "personalized":
      recommendations = await recommendationEngine.getPersonalizedRecommendations(userId);
      break;
    case "trending":
      recommendations = await recommendationEngine.getTrendingProducts();
      break;
    default:
      recommendations = await recommendationEngine.getProductRecommendations(productId, userId);
  }

  return Response.json(recommendations);
}
```

### Get Homepage Recommendations

```
GET /api/v1/recommendations/homepage
Query: ?userId=xxx
Response: {
  frequentlyBought: [...],
  personalized: [...],
  trending: [...],
  featured: [...]
}
```

---

## 4. ORDER TRACKING API

### Get Tracking Info

```
GET /api/v1/orders/{orderId}/tracking
Response: {
  tracking: {
    trackingNumber,
    carrier,
    status,
    estimatedDelivery,
    lastUpdated
  },
  events: [
    { status, timestamp, location, description },
    ...
  ]
}
```

**File:** `src/app/api/v1/orders/[orderId]/tracking/route.ts`

```typescript
import { orderTrackingService } from "@/lib/services";

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  const tracking = await orderTrackingService.getTrackingInfo(params.orderId);
  const history = await orderTrackingService.getTrackingHistory(params.orderId);

  return Response.json({ tracking, history });
}
```

### Get Public Tracking (anonymous)

```
GET /api/v1/tracking/public/{trackingNumber}
Response: { ...tracking info, limited details }
```

---

## 5. LOYALTY PROGRAM API

### Get Loyalty Account

```
GET /api/v1/loyalty
Authorization: Bearer token
Response: {
  tier: "silver",
  totalPoints: 1250,
  availablePoints: 500,
  totalSpent: 1250.00,
  tierBenefits: [...],
  nextTierRequirement: 2000,
  progressToNextTier: 62.5,
  history: [{ amount, type, source, timestamp }, ...]
}
```

**File:** `src/app/api/v1/loyalty/route.ts`

```typescript
import { loyaltyProgramService } from "@/lib/services";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await loyaltyProgramService.getAccount(session.user.id);
  const history = await loyaltyProgramService.getPointsHistory(session.user.id, 50);
  const benefits = loyaltyProgramService.getTierBenefits(account.tier);

  return Response.json({
    account,
    history,
    benefits,
    allTiers: loyaltyProgramService.getAllTiers(),
  });
}
```

### Redeem Points

```
POST /api/v1/loyalty/redeem
Authorization: Bearer token
Body: { points: 100 }
Response: {
  success: true,
  newAvailablePoints: 400,
  discountAmount: 1.00,
  transactionId: "txn_xxx"
}
```

**File:** `src/app/api/v1/loyalty/redeem/route.ts`

### Referral

```
POST /api/v1/loyalty/referral
Authorization: Bearer token
Body: { refereeEmail: "friend@example.com" }
Response: {
  referralCode: "REF_xxx",
  referralUrl: "https://kashcraft.com?ref=REF_xxx"
}
```

---

## 6. EMAIL & MARKETING API

### Newsletter Subscription

```
POST /api/v1/marketing/subscribe
Body: { email: "user@example.com", firstName?: "John", lastName?: "Doe" }
Response: { success: true, subscriptionId: "sub_xxx" }
```

**File:** `src/app/api/v1/marketing/subscribe/route.ts`

```typescript
import { emailMarketingService } from "@/lib/services";

export async function POST(request: Request) {
  const { email, firstName, lastName } = await request.json();

  try {
    const result = await emailMarketingService.addSubscriber(email, firstName, lastName);
    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

### Unsubscribe

```
POST /api/v1/marketing/unsubscribe
Body: { email: "user@example.com" }
Response: { success: true }
```

---

## 7. GIFT CARDS & VOUCHERS API

### Validate Gift Card

```
POST /api/v1/gift-cards/validate
Body: { code: "GC-XXXX-XXXX-XXXX-XXXX" }
Response: {
  valid: true,
  balance: 75.50,
  message: "Gift card is valid"
}
```

**File:** `src/app/api/v1/gift-cards/validate/route.ts`

```typescript
import { giftCardVoucherService } from "@/lib/services";

export async function POST(request: Request) {
  const { code } = await request.json();

  try {
    const giftCard = await giftCardVoucherService.getGiftCard(code);
    const valid = await giftCardVoucherService.validateGiftCard(code);

    return Response.json({
      valid,
      balance: giftCard?.balance,
      lastFourDigits: code.slice(-4),
    });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 400 });
  }
}
```

### Redeem Gift Card

```
POST /api/v1/gift-cards/redeem
Body: { code: "GC-...", orderId: "ord_xxx", amount: 50.00 }
Authorization: Bearer token
Response: {
  success: true,
  remainingBalance: 25.50,
  transactionId: "txn_xxx"
}
```

### Validate Voucher

```
POST /api/v1/vouchers/validate
Body: { code: "VC-XXXXXX", orderTotal: 99.99 }
Response: {
  valid: true,
  discountType: "percentage",
  discountValue: 10,
  maxDiscount: 15.00,
  estimatedDiscount: 10.00
}
```

**File:** `src/app/api/v1/vouchers/validate/route.ts`

---

## 8. MULTI-CURRENCY API

### Convert Currency

```
GET /api/v1/currency/convert
Query: ?from=USD&to=EUR&amount=100
Response: {
  from: "USD",
  to: "EUR",
  amount: 100,
  rate: 0.92,
  convertedAmount: 92.00
}
```

**File:** `src/app/api/v1/currency/convert/route.ts`

```typescript
import { multiCurrencyService } from "@/lib/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "USD";
  const to = searchParams.get("to") || "USD";
  const amount = parseFloat(searchParams.get("amount") || "1");

  const result = multiCurrencyService.convertCurrency(amount, from, to);
  return Response.json(result);
}
```

### Detect User Currency

```
GET /api/v1/currency/detect
Response: {
  currency: "USD",
  currencyCode: "USD",
  currencySymbol: "$",
  country: "United States"
}
```

### Get Exchange Rates

```
GET /api/v1/currency/rates
Query: ?baseCurrency=USD
Response: {
  baseCurrency: "USD",
  timestamp: "2024-01-01T00:00:00Z",
  rates: {
    EUR: 0.92,
    GBP: 0.78,
    JPY: 110.5,
    ...
  }
}
```

---

## 9. SIZE GUIDES API

### Get Size Guide

```
GET /api/v1/products/{productId}/size-guide
Response: {
  guide: {
    name: "Men's Clothing",
    measurements: [
      { size: "S", chest: 36, waist: 30, length: 28 },
      ...
    ],
    fitDescription: "...",
    conversionCharts: { US: [...], EU: [...], UK: [...] }
  }
}
```

**File:** `src/app/api/v1/products/[productId]/size-guide/route.ts`

```typescript
import { sizeGuideService } from "@/lib/services";

export async function GET(request: Request, { params }: { params: { productId: string } }) {
  const guide = await sizeGuideService.getSizeGuideForProduct(params.productId);
  return Response.json({ guide });
}
```

### Get Size Recommendation

```
POST /api/v1/size-guides/{guideId}/recommend
Body: { measurements: { chest: 36, waist: 30, length: 28 } }
Response: {
  recommendedSize: "S",
  confidence: 0.95,
  nextBestSize: "XS"
}
```

---

## 10. PRODUCT COMPARISON API

### Compare Products

```
POST /api/v1/products/compare
Body: { productIds: ["prod_1", "prod_2", "prod_3"] }
Response: {
  products: [...],
  specs: [
    { key: "price", label: "Price", values: [99, 89, 109], highlighted: true },
    ...
  ],
  differences: ["Price varies by $20", ...]
}
```

**File:** `src/app/api/v1/products/compare/route.ts`

```typescript
import { productComparisonService } from "@/lib/services";

export async function POST(request: Request) {
  const { productIds } = await request.json();

  if (!Array.isArray(productIds) || productIds.length > 4) {
    return Response.json(
      {
        error: "Provide 2-4 product IDs",
      },
      { status: 400 }
    );
  }

  const comparison = await productComparisonService.compareProducts(productIds);
  return Response.json(comparison);
}
```

### Save Comparison

```
POST /api/v1/comparisons/save
Authorization: Bearer token
Body: { name: "My Comparison", productIds: ["prod_1", "prod_2"] }
Response: { comparisonId: "cmp_xxx", shareUrl: "..." }
```

**File:** `src/app/api/v1/comparisons/save/route.ts`

---

## 11. PRODUCT WAITLIST API

### Add to Waitlist

```
POST /api/v1/waitlist
Authorization: Bearer token
Body: { productId: "prod_xxx", email?: "user@example.com" }
Response: {
  success: true,
  position: 1,
  waitlistId: "wl_xxx"
}
```

**File:** `src/app/api/v1/waitlist/route.ts`

```typescript
import { productWaitlistService } from "@/lib/services";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, email } = await request.json();

  try {
    const entry = await productWaitlistService.addToWaitlist(
      session.user.id,
      productId,
      email || session.user.email
    );

    const position = await productWaitlistService.getWaitlistPosition(session.user.id, productId);

    return Response.json({ success: true, position, waitlistId: entry.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

### Get User Waitlist

```
GET /api/v1/waitlist
Authorization: Bearer token
Response: [
  { productId, productName, position, addedAt, status },
  ...
]
```

### Remove from Waitlist

```
DELETE /api/v1/waitlist/{productId}
Authorization: Bearer token
Response: { success: true }
```

---

## 12. QUICK CHECKOUT API

### Save Payment Method

```
POST /api/v1/quick-checkout/payment-methods
Authorization: Bearer token
Body: {
  type: "credit_card",
  token: "tok_xxx",
  last4: "4242",
  cardholderName: "John Doe",
  expiryMonth: 12,
  expiryYear: 2025,
  isDefault: true
}
Response: { methodId: "pm_xxx", isDefault: true }
```

**File:** `src/app/api/v1/quick-checkout/payment-methods/route.ts`

```typescript
import { quickBuyService } from "@/lib/services";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const method = await quickBuyService.savePaymentMethod(
    session.user.id,
    body.type,
    body.token,
    body.last4,
    body.cardholderName,
    body.expiryMonth,
    body.expiryYear,
    body.isDefault
  );

  return Response.json(method);
}
```

### Get Payment Methods

```
GET /api/v1/quick-checkout/payment-methods
Authorization: Bearer token
Response: [
  { id, type, last4, cardholderName, isDefault },
  ...
]
```

### Save Address

```
POST /api/v1/quick-checkout/addresses
Authorization: Bearer token
Body: {
  type: "shipping",
  label: "Home",
  fullName: "John Doe",
  streetAddress: "123 Main St",
  city: "Anytown",
  state: "CA",
  postalCode: "12345",
  country: "US",
  phone: "555-1234",
  isDefault: true
}
Response: { addressId: "addr_xxx" }
```

### Get Addresses

```
GET /api/v1/quick-checkout/addresses
Authorization: Bearer token
Response: [
  { id, type, label, city, state, isDefault },
  ...
]
```

### Quick Buy

```
POST /api/v1/quick-checkout/buy
Authorization: Bearer token
Body: {
  productId: "prod_xxx",
  quantity: 1,
  paymentMethodId: "pm_xxx",
  shippingAddressId: "addr_xxx",
  billingAddressId?: "addr_yyy"
}
Response: {
  success: true,
  orderId: "ord_xxx",
  total: 99.99
}
```

---

## 13. BLOG API

### Get Blog Posts

```
GET /api/v1/blog/posts
Query: ?page=1&limit=10&category=guides&featured=true
Response: {
  posts: [
    { id, title, slug, excerpt, image, author, publishedAt, viewCount },
    ...
  ],
  total: 45,
  page: 1,
  limit: 10
}
```

**File:** `src/app/api/v1/blog/posts/route.ts`

```typescript
import { blogContentService } from "@/lib/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";

  const results = await blogContentService.getPublishedPosts(page, limit, category, featured);

  return Response.json(results);
}
```

### Get Blog Post

```
GET /api/v1/blog/posts/{slug}
Response: {
  id,
  title,
  slug,
  content,
  excerpt,
  author,
  category,
  tags,
  image,
  seoTitle,
  seoDescription,
  seoKeywords,
  viewCount,
  publishedAt,
  relatedPosts: [...]
}
```

**File:** `src/app/api/v1/blog/posts/[slug]/route.ts`

### Get Blog Categories

```
GET /api/v1/blog/categories
Response: [
  { id, name, slug, description, postCount },
  ...
]
```

### Search Blog

```
GET /api/v1/blog/search
Query: ?q=sizing
Response: [
  { id, title, slug, excerpt, image },
  ...
]
```

### Create Blog Post (Admin)

```
POST /api/v1/blog/posts
Authorization: Bearer token (admin required)
Body: { title, content, excerpt, author, categoryId, tags, featured, ... }
Response: { id, slug, ... }
```

---

## Request/Response Patterns

### Success Response

```json
{
  "data": {
    /* actual data */
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Common Query Parameters

| Parameter | Type   | Default   | Description                 |
| --------- | ------ | --------- | --------------------------- |
| page      | int    | 1         | Pagination page number      |
| limit     | int    | 20        | Items per page              |
| sortBy    | string | relevance | Sort field                  |
| search    | string | -         | Search query                |
| filter    | string | -         | Filter criteria             |
| userId    | string | -         | User ID for personalization |

---

## Authentication

**JWT Bearer Token** required for routes marked with `Authorization: Bearer token`

```typescript
// Pattern for protected routes
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic here
}
```

---

## Rate Limiting Recommendations

| Endpoint          | Limit | Window   |
| ----------------- | ----- | -------- |
| Search            | 100   | 1 minute |
| Loyalty endpoints | 50    | 1 minute |
| Gift card redeem  | 10    | 1 minute |
| Blog posts        | 1000  | 1 minute |
| Quick checkout    | 20    | 1 minute |

---

## Testing Checklist

- [ ] Test each endpoint with valid data
- [ ] Test validation errors (missing/invalid fields)
- [ ] Test authentication (with/without token)
- [ ] Test authorization (user can only access own data)
- [ ] Test pagination
- [ ] Test filtering and sorting
- [ ] Test error responses
- [ ] Test performance with large datasets
- [ ] Test concurrent requests
