# Features Implementation Guide

## Phase 9-13: Advanced E-Commerce Features

This guide documents the implementation of 14 advanced e-commerce features for the Kashcraft platform.

---

## Table of Contents

1. [Phase 9: Real-time & Tracking](#phase-9)
2. [Phase 10: Search & Recommendations](#phase-10)
3. [Phase 11: Marketing & Engagement](#phase-11)
4. [Phase 12: Commerce Features](#phase-12)
5. [Phase 13: Content & Support](#phase-13)
6. [API Integration Examples](#api-examples)
7. [Database Schema Updates](#database-updates)
8. [Frontend Component Examples](#frontend-examples)

---

## Phase 9: Real-time & Tracking {#phase-9}

### Prompt 171: Real-time Inventory Updates

**Service:** `RealTimeInventoryService`
**File:** `src/lib/services/inventory/real-time-inventory.service.ts`

**Features:**

- Real-time stock level tracking
- WebSocket-ready event emitters
- Inventory reservations during checkout
- Low stock warnings
- Stock history tracking

**Key Methods:**

```typescript
// Get current stock level
const stock = await realTimeInventoryService.getStockLevel(productId);

// Reserve inventory during checkout
const reserved = await realTimeInventoryService.reserveInventory(productId, quantity, orderId);

// Get products with low stock
const lowStock = await realTimeInventoryService.getLowStockProducts();

// Get inventory metrics
const metrics = await realTimeInventoryService.getInventoryMetrics();
```

**Events:**

- `inventory-updated` - When stock changes
- `low-stock-warning` - When stock falls below threshold
- `inventory-reserved` - When checkout reserves items

### Prompt 175: Order Tracking

**Service:** `OrderTrackingService`
**File:** `src/lib/services/orders/order-tracking.service.ts`

**Features:**

- Multi-carrier tracking support
- Real-time status updates
- Delivery metrics & analytics
- Customer notifications
- Delayed shipment detection

**Key Methods:**

```typescript
// Create tracking for order
const tracking = await orderTrackingService.createTracking(
  orderId,
  trackingNumber,
  carrier,
  estimatedDelivery
);

// Update order status
await orderTrackingService.updateOrderStatus(
  orderId,
  "shipped",
  "shipped",
  "Order has been shipped"
);

// Get tracking history
const history = await orderTrackingService.getTrackingHistory(orderId);

// Get delivery metrics
const metrics = await orderTrackingService.getDeliveryMetrics();
```

---

## Phase 10: Search & Recommendations {#phase-10}

### Prompt 172: Advanced Search Filters

**Service:** `AdvancedSearchService`
**File:** `src/lib/services/search/advanced-search.service.ts`

**Features:**

- Faceted search (category, price, rating)
- Range filters
- Multi-select filters
- Search history tracking
- Popular searches
- Auto-suggestions

**Key Methods:**

```typescript
// Search with filters
const results = await advancedSearchService.search({
  query: "blue shirt",
  filters: [
    { field: "category", values: ["clothing"] },
    { field: "price", values: { min: 20, max: 100 } },
    { field: "rating", values: ["4"] },
  ],
  sortBy: "price_asc",
  page: 1,
  limit: 20,
});

// Get search suggestions
const suggestions = await advancedSearchService.getSuggestions("blue");

// Get user's search history
const history = await advancedSearchService.getSearchHistory(userId);

// Get popular searches
const popular = await advancedSearchService.getPopularSearches();
```

**Facet Structure:**

```typescript
{
  field: 'category',
  values: [
    { label: 'Clothing', value: 'cat-1', count: 120 },
    { label: 'Shoes', value: 'cat-2', count: 85 }
  ]
}
```

### Prompt 173: Recommendations Engine

**Service:** `RecommendationEngine`
**File:** `src/lib/services/recommendations/recommendation.service.ts`

**Features:**

- Frequently bought together
- Similar products
- Personalized recommendations
- Trending products
- Homepage recommendations
- Collaborative filtering

**Key Methods:**

```typescript
// Get frequently bought together
const fbt = await recommendationEngine.getFrequentlyBoughtTogether(productId);

// Get similar products
const similar = await recommendationEngine.getSimilarProducts(productId);

// Get personalized recommendations
const personalized = await recommendationEngine.getPersonalizedRecommendations(userId);

// Get trending products
const trending = await recommendationEngine.getTrendingProducts();

// Get all recommendations for a product
const all = await recommendationEngine.getProductRecommendations(productId, userId);
```

---

## Phase 11: Marketing & Engagement {#phase-11}

### Prompt 174: Email Marketing Integration

**Service:** `EmailMarketingService`
**File:** `src/lib/services/marketing/email-marketing.service.ts`

**Features:**

- Mailchimp/SendGrid integration
- Welcome emails
- Abandoned cart recovery
- Order confirmations
- Shipment notifications
- Newsletter campaigns
- Campaign analytics

**Key Methods:**

```typescript
// Send welcome email
await emailMarketingService.sendWelcomeEmail(email, firstName);

// Send abandoned cart email
await emailMarketingService.sendAbandonedCartEmail(email, cartItems, cartTotal, recoveryLink);

// Send order confirmation
await emailMarketingService.sendOrderConfirmationEmail(email, orderData);

// Add to subscriber list
await emailMarketingService.addSubscriber(email, firstName, lastName);

// Send newsletter
await emailMarketingService.sendNewsletter(subscriberList, subject, html);
```

**Configuration:**

```env
# .env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=sg_xxx
MAILCHIMP_API_KEY=xxx
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_LIST_ID=xxx
EMAIL_FROM=noreply@kashcraft.com
```

### Prompt 176: Gift Cards & Vouchers

**Service:** `GiftCardVoucherService`
**File:** `src/lib/services/ecommerce/gift-card-voucher.service.ts`

**Features:**

- Gift card creation & management
- Bulk creation for campaigns
- Redemption with balance tracking
- Voucher/coupon code system
- Expiration handling
- Statistics & analytics

**Key Methods:**

```typescript
// Create gift card
const giftCard = await giftCardVoucherService.createGiftCard(100, 365);

// Bulk create gift cards
const cards = await giftCardVoucherService.bulkCreateGiftCards(100, 50, 365);

// Get gift card
const card = await giftCardVoucherService.getGiftCard(code);

// Validate gift card
const valid = await giftCardVoucherService.validateGiftCard(code);

// Redeem gift card
const result = await giftCardVoucherService.redeemGiftCard(code, orderId, userId, amount);

// Create voucher
const voucher = await giftCardVoucherService.createVoucher("percentage", 10, 100, 30);

// Validate voucher
const vvalid = await giftCardVoucherService.validateVoucher(code, orderValue);
```

**Gift Card Format:** `GC-XXXX-XXXX-XXXX-XXXX`
**Voucher Format:** `VC-XXXXXX`

### Prompt 177: Loyalty Program

**Service:** `LoyaltyProgramService`
**File:** `src/lib/services/loyalty/loyalty-program.service.ts`

**Features:**

- Points system (1 point = $0.01)
- 4 tier levels (Bronze, Silver, Gold, Platinum)
- Tier benefits & progression
- Signup, referral, & review bonuses
- Points redemption
- Member analytics

**Tier Benefits:**
| Tier | Min Points | Min Spent | Multiplier |
|------|-----------|----------|-----------|
| Bronze | 0 | $0 | 1x |
| Silver | 500 | $250 | 1.25x |
| Gold | 2000 | $1000 | 1.5x |
| Platinum | 5000 | $3000 | 2x |

**Key Methods:**

```typescript
// Initialize account
const account = await loyaltyProgramService.initializeAccount(userId);

// Get account info
const info = await loyaltyProgramService.getAccount(userId);

// Add points for purchase
const points = await loyaltyProgramService.addPointsForPurchase(userId, orderAmount, orderId);

// Redeem points
const result = await loyaltyProgramService.redeemPoints(userId, 100);

// Add referral bonus
await loyaltyProgramService.addReferralBonus(referrerId, refereeId);

// Get tier benefits
const benefits = loyaltyProgramService.getTierBenefits("gold");

// Get all tiers
const allTiers = loyaltyProgramService.getAllTiers();
```

---

## Phase 12: Commerce Features {#phase-12}

### Prompt 178: Multi-Currency Support

**Service:** `MultiCurrencyService`
**File:** `src/lib/services/localization/multi-currency.service.ts`

**Features:**

- 9 supported currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR)
- Real-time exchange rate updates
- Automatic user currency detection
- Price formatting by locale
- Conversion fee handling

**Supported Currencies:**

- USD ($), EUR (€), GBP (£), JPY (¥)
- CAD (C$), AUD (A$), CHF, CNY (¥), INR (₹)

**Key Methods:**

```typescript
// Convert currency
const conversion = multiCurrencyService.convertCurrency(100, "USD", "EUR");
// { from: 'USD', to: 'EUR', amount: 100, convertedAmount: 92, rate: 0.92 }

// Get price in currency
const price = multiCurrencyService.getPriceInCurrency(100, "EUR");
// { price: 92, formatted: '€92.00' }

// Detect user currency
const currency = await multiCurrencyService.detectUserCurrency(ipAddress);

// Format price
const formatted = multiCurrencyService.formatPrice(99.99, "USD");
// '$99.99'

// Get exchange rates
const rates = multiCurrencyService.getExchangeRates("USD");

// Get currency
const usd = multiCurrencyService.getCurrency("USD");
```

### Prompt 179: Size Guides & Charts

**Service:** `SizeGuideService`
**File:** `src/lib/services/products/size-guide.service.ts`

**Features:**

- Product-specific and category size guides
- Measurement charts
- Size conversion (US, EU, UK)
- Fit recommendations
- Multiple measurement types

**Key Methods:**

```typescript
// Get size guide for product
const guide = await sizeGuideService.getSizeGuideForProduct(productId);

// Create size guide
const newGuide = await sizeGuideService.createSizeGuide(
  "Men's Clothing",
  [
    { size: "S", chest: 36, waist: 30, length: 28 },
    { size: "M", chest: 38, waist: 32, length: 29 },
  ],
  undefined,
  categoryId
);

// Get size recommendation
const recommended = await sizeGuideService.getSizeRecommendation(guideId, { chest: 36, waist: 30 });

// Convert size
const euSize = sizeGuideService.convertSize("M", "US", "EU");
// '36'
```

### Prompt 180: Product Comparison

**Service:** `ProductComparisonService`
**File:** `src/lib/services/products/product-comparison.service.ts`

**Features:**

- Side-by-side comparison (up to 4 products)
- Automatic difference highlighting
- HTML & CSV export
- Save comparisons for sharing
- Comparison history

**Key Methods:**

```typescript
// Compare products
const comparison = await productComparisonService.compareProducts([
  productId1,
  productId2,
  productId3,
]);

// Generate HTML for printing
const html = productComparisonService.generateComparisonHTML(comparison);

// Generate CSV export
const csv = productComparisonService.generateComparisonCSV(comparison);

// Save comparison
const saved = await productComparisonService.saveComparison(userId, "My Comparison", productIds);

// Get saved comparison
const loaded = await productComparisonService.getSavedComparison(comparisonId);

// Delete comparison
await productComparisonService.deleteSavedComparison(comparisonId);
```

**Comparison Output:**

```typescript
{
  products: [/* 3-4 products */],
  specs: [
    { key: 'price', label: 'Price', values: [99, 89, 109], highlighted: true },
    { key: 'rating', label: 'Rating', values: [4.5, 4.8, 4.2], highlighted: true }
  ],
  differences: ['Price varies by $20', 'Rating: 4.5 vs 4.8 vs 4.2']
}
```

### Prompt 183: Product Waitlist

**Service:** `ProductWaitlistService`
**File:** `src/lib/services/products/product-waitlist.service.ts`

**Features:**

- Back-in-stock notifications
- Waitlist position tracking
- Automatic notifications
- Conversion tracking
- Waitlist analytics

**Key Methods:**

```typescript
// Add to waitlist
const entry = await productWaitlistService.addToWaitlist(userId, productId, email);

// Check if on waitlist
const isWaiting = await productWaitlistService.isOnWaitlist(userId, productId);

// Get waitlist position
const position = await productWaitlistService.getWaitlistPosition(userId, productId);
// 1 (highest priority = oldest signup)

// Notify waitlist when back in stock
const notified = await productWaitlistService.notifyWaitlist(productId);

// Get waitlist statistics
const stats = await productWaitlistService.getWaitlistStats(productId);

// Export waitlist to CSV
const csv = await productWaitlistService.exportWaitlistCSV(productId);
```

### Prompt 184: Quick Buy/Checkout

**Service:** `QuickBuyService`
**File:** `src/lib/services/checkout/quick-buy.service.ts`

**Features:**

- One-click checkout
- Saved payment methods
- Saved addresses
- Quick recall of defaults
- Session management

**Key Methods:**

```typescript
// Save payment method
const method = await quickBuyService.savePaymentMethod(
  userId,
  "credit_card",
  token,
  "4242",
  "John Doe",
  12,
  2025,
  true // isDefault
);

// Get saved payment methods
const methods = await quickBuyService.getPaymentMethods(userId);

// Save address
const address = await quickBuyService.saveAddress(
  userId,
  "shipping",
  "Home",
  "John Doe",
  "123 Main St",
  "Anytown",
  "CA",
  "12345",
  "US",
  "5551234567",
  true // isDefault
);

// Create quick checkout session
const session = await quickBuyService.createQuickCheckoutSession(
  userId,
  productId,
  1,
  paymentMethodId,
  addressId
);
```

---

## Phase 13: Content & Support {#phase-13}

### Prompt 181: Blog/Content Section

**Service:** `BlogContentService`
**File:** `src/lib/services/content/blog-content.service.ts`

**Features:**

- Blog post creation & management
- Categories & tagging
- SEO optimization (meta, keywords)
- Featured content
- Search functionality
- Statistics & analytics
- Sitemap generation

**Key Methods:**

```typescript
// Create blog post
const post = await blogContentService.createBlogPost(
  "How to Choose the Right Size",
  "Full HTML content...",
  "Learn how to find your perfect fit",
  "John Doe",
  categoryId,
  ["sizing", "guide", "fit"],
  "/image.jpg",
  "How to Choose Size",
  "Learn sizing best practices",
  ["sizing", "fit", "guide"],
  true, // featured
  "published"
);

// Get published posts
const result = await blogContentService.getPublishedPosts(1, 10, "guides");

// Get single post
const post = await blogContentService.getBlogPostBySlug("how-to-choose-size");

// Get featured posts
const featured = await blogContentService.getFeaturedPosts(5);

// Search posts
const results = await blogContentService.searchBlogPosts("sizing");

// Get related posts
const related = await blogContentService.getRelatedPosts(postId);

// Generate blog sitemap
const sitemap = await blogContentService.generateBlogSitemap();
```

---

## API Integration Examples {#api-examples}

### Real-time Inventory API

```typescript
// src/app/api/inventory/route.ts
import { realTimeInventoryService } from "@/lib/services/inventory/real-time-inventory.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const stock = await realTimeInventoryService.getStockLevel(productId);
  return Response.json(stock);
}
```

### Search API with Filters

```typescript
// src/app/api/search/route.ts
import { advancedSearchService } from "@/lib/services/search/advanced-search.service";

export async function POST(request: Request) {
  const body = await request.json();
  const { query, filters, sortBy, page, limit, userId } = body;

  const results = await advancedSearchService.search({
    query,
    filters,
    sortBy,
    page,
    limit,
    userId,
  });

  return Response.json(results);
}
```

### Recommendations API

```typescript
// src/app/api/recommendations/route.ts
import { recommendationEngine } from "@/lib/services/recommendations/recommendation.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'frequent', 'similar', 'personalized'
  const productId = searchParams.get("productId");
  const userId = searchParams.get("userId");

  let recommendations;

  if (type === "frequent") {
    recommendations = await recommendationEngine.getFrequentlyBoughtTogether(productId);
  } else if (type === "similar") {
    recommendations = await recommendationEngine.getSimilarProducts(productId);
  } else if (type === "personalized" && userId) {
    recommendations = await recommendationEngine.getPersonalizedRecommendations(userId);
  }

  return Response.json(recommendations);
}
```

### Order Tracking API

```typescript
// src/app/api/orders/[id]/tracking/route.ts
import { orderTrackingService } from "@/lib/services/orders/order-tracking.service";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tracking = await orderTrackingService.getTrackingInfo(params.id);
  const history = await orderTrackingService.getTrackingHistory(params.id);

  return Response.json({ tracking, history });
}
```

### Loyalty Program API

```typescript
// src/app/api/loyalty/route.ts
import { loyaltyProgramService } from "@/lib/services/loyalty/loyalty-program.service";

export async function GET(request: Request) {
  const session = await getSession();
  const account = await loyaltyProgramService.getAccount(session.user.id);

  return Response.json(account);
}

export async function POST(request: Request) {
  const { action, ...data } = await request.json();
  const session = await getSession();

  if (action === "redeem") {
    const result = await loyaltyProgramService.redeemPoints(session.user.id, data.points);
    return Response.json(result);
  }
}
```

### Gift Card API

```typescript
// src/app/api/gift-cards/route.ts
import { giftCardVoucherService } from "@/lib/services/ecommerce/gift-card-voucher.service";

export async function POST(request: Request) {
  const { action, code, orderId, amount } = await request.json();
  const session = await getSession();

  if (action === "validate") {
    const valid = await giftCardVoucherService.validateGiftCard(code);
    return Response.json(valid);
  }

  if (action === "redeem") {
    const result = await giftCardVoucherService.redeemGiftCard(
      code,
      orderId,
      session.user.id,
      amount
    );
    return Response.json(result);
  }
}
```

---

## Database Schema Updates {#database-updates}

Add these tables to your Prisma schema:

```prisma
// Inventory
model Inventory {
  id        String @id @default(cuid())
  productId String @unique
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku       String?
  quantity  Int @default(0)
  reserved  Int @default(0)
  reorderLevel Int @default(10)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  reservations InventoryReservation[]
  logs InventoryLog[]
}

model InventoryReservation {
  id String @id @default(cuid())
  inventory Inventory @relation(fields: [productId], references: [productId], onDelete: Cascade)
  productId String
  quantity Int
  orderId String
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model InventoryLog {
  id String @id @default(cuid())
  inventory Inventory @relation(fields: [productId], references: [productId], onDelete: Cascade)
  productId String
  quantityChange Int
  reason String
  userId String?
  notes String?
  createdAt DateTime @default(now())
}

// Tracking
model OrderTracking {
  id String @id @default(cuid())
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId String @unique
  trackingNumber String @unique
  carrier String
  currentStatus String
  estimatedDelivery DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  events TrackingEvent[]
}

model TrackingEvent {
  id String @id @default(cuid())
  tracking OrderTracking @relation(fields: [orderId], references: [orderId], onDelete: Cascade)
  orderId String
  status String
  type String
  timestamp DateTime @default(now())
  location String?
  description String
  trackingNumber String?
}

// Search History
model SearchHistory {
  id String @id @default(cuid())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  query String
  resultCount Int
  clickedProduct String?
  timestamp DateTime @default(now())
}

// Loyalty
model LoyaltyAccount {
  id String @id @default(cuid())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String @unique
  tier String @default("bronze")
  totalPoints Int @default(0)
  availablePoints Int @default(0)
  totalSpent Decimal @default(0)
  totalPurchases Int @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  history PointsHistory[]
}

model PointsHistory {
  id String @id @default(cuid())
  account LoyaltyAccount @relation(fields: [userId], references: [userId], onDelete: Cascade)
  userId String
  amount Int
  type String
  reason String
  transactionId String?
  timestamp DateTime @default(now())
}

// Gift Cards
model GiftCard {
  id String @id @default(cuid())
  code String @unique
  balance Decimal
  initialValue Decimal
  status String @default("active")
  expiresAt DateTime
  usedAt DateTime?
  usedBy String?
  createdAt DateTime @default(now())

  usage GiftCardUsage[]
}

model GiftCardUsage {
  id String @id @default(cuid())
  giftCard GiftCard @relation(fields: [giftCardId], references: [id], onDelete: Cascade)
  giftCardId String
  orderId String
  userId String
  amountUsed Decimal
  createdAt DateTime @default(now())
}

// Vouchers
model Voucher {
  id String @id @default(cuid())
  code String @unique
  discountType String
  discountValue Decimal
  maxUsages Int
  usageCount Int @default(0)
  expiresAt DateTime
  minOrderValue Decimal?
  maxDiscount Decimal?
  createdAt DateTime @default(now())

  usage VoucherUsage[]
}

model VoucherUsage {
  id String @id @default(cuid())
  voucher Voucher @relation(fields: [voucherId], references: [id], onDelete: Cascade)
  voucherId String
  orderId String
  discountAmount Decimal
  createdAt DateTime @default(now())
}

// Waitlist
model Waitlist {
  id String @id @default(cuid())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  email String
  status String @default("active")
  createdAt DateTime @default(now())
  notifiedAt DateTime?

  @@unique([userId, productId])
}

// Quick Checkout
model SavedPaymentMethod {
  id String @id @default(cuid())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  type String
  token String
  last4 String
  cardholderName String
  expiryMonth Int?
  expiryYear Int?
  isDefault Boolean @default(false)
  createdAt DateTime @default(now())
}

model SavedAddress {
  id String @id @default(cuid())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  type String
  label String
  fullName String
  streetAddress String
  city String
  state String
  postalCode String
  country String
  phone String
  isDefault Boolean @default(false)
  createdAt DateTime @default(now())
}

model QuickCheckoutSession {
  sessionId String @id
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  productId String
  quantity Int
  paymentMethodId String
  shippingAddressId String
  billingAddressId String?
  createdAt DateTime @default(now())
}

// Blog
model BlogCategory {
  id String @id @default(cuid())
  name String
  slug String @unique
  description String?
  image String?
  createdAt DateTime @default(now())

  posts BlogPost[]
}

model BlogPost {
  id String @id @default(cuid())
  title String
  slug String @unique
  content String
  excerpt String
  author String
  category BlogCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  tags String?
  featured Boolean @default(false)
  status String @default("draft")
  image String?
  seoTitle String?
  seoDescription String?
  seoKeywords String?
  viewCount Int @default(0)
  viewsLastMonth Int @default(0)
  likes Int @default(0)
  comments Int @default(0)
  publishedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Size Guides
model SizeGuide {
  id String @id @default(cuid())
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  productId String?
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  categoryId String?
  name String
  measurements String
  fitDescription String?
  conversionCharts String?
  images String?
  createdAt DateTime @default(now())
}

// Product Comparison
model SavedComparison {
  id String @id @default(cuid())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  name String
  productIds String
  createdAt DateTime @default(now())
}
```

---

## Frontend Component Examples {#frontend-examples}

### Real-time Stock Badge

```typescript
// app/products/[id]/stock-badge.tsx
import { RealTimeInventoryService } from '@/lib/services';

export async function StockBadge({ productId }: { productId: string }) {
  const stock = await realTimeInventoryService.getStockLevel(productId);

  if (!stock) return null;

  return (
    <div className={`badge ${stock.isLowStock ? 'badge-warning' : 'badge-success'}`}>
      {stock.isLowStock ? (
        <>
          ⚠️ Only {stock.available} left
        </>
      ) : (
        <>
          ✓ In Stock ({stock.available})
        </>
      )}
    </div>
  );
}
```

### Product Comparison Component

```typescript
// app/products/comparison/comparison-view.tsx
'use client';

import { productComparisonService } from '@/lib/services';
import { useState } from 'react';

export function ComparisonView({ productIds }: { productIds: string[] }) {
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await productComparisonService.compareProducts(productIds);
      setComparison(result);
    };
    load();
  }, [productIds]);

  if (!comparison) return <div>Loading...</div>;

  return (
    <div className="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Specification</th>
            {comparison.products.map(p => (
              <th key={p.id}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.specs.map(spec => (
            <tr key={spec.key} className={spec.highlighted ? 'highlighted' : ''}>
              <td><strong>{spec.label}</strong></td>
              {spec.values.map((val, idx) => (
                <td key={idx}>{val || 'N/A'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="differences">
        <h3>Key Differences</h3>
        <ul>
          {comparison.differences.map((diff, idx) => (
            <li key={idx}>{diff}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### Loyalty Points Display

```typescript
// app/account/loyalty-card.tsx
'use client';

import { loyaltyProgramService } from '@/lib/services';
import { useEffect, useState } from 'react';

export function LoyaltyCard({ userId }: { userId: string }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    async function load() {
      const acc = await loyaltyProgramService.getAccount(userId);
      setAccount(acc);
    }
    load();
  }, [userId]);

  if (!account) return null;

  const tier = loyaltyProgramService.getTierBenefits(account.tier);

  return (
    <div className="loyalty-card">
      <h2>{account.tier.toUpperCase()} Member</h2>

      <div className="points">
        <p>Available Points: <strong>{account.availablePoints}</strong></p>
        <p>Total Points: {account.totalPoints}</p>
      </div>

      <div className="progress">
        <h3>Progress to {account.nextTierRequirement}</h3>
        <progress value={account.tierProgress} max={100} />
        <p>${account.totalSpent} of ${account.nextTierRequirement} spent</p>
      </div>

      <div className="benefits">
        <h4>Your Benefits:</h4>
        <ul>
          {tier?.benefitDescription.map((benefit, idx) => (
            <li key={idx}>{benefit}</li>
          ))}
        </ul>
      </div>

      <button onclick={() => {
        // Open redeem modal
      }}>
        Redeem Points
      </button>
    </div>
  );
}
```

---

## Deployment Checklist

- [ ] All services configured and tested
- [ ] Database migrations applied
- [ ] API routes created and tested
- [ ] Frontend components integrated
- [ ] Email provider configured
- [ ] Currency rates configured
- [ ] Search indexes built
- [ ] Recommendation engine trained
- [ ] WebSocket connections ready (if using SSE/WebSockets)
- [ ] Analytics tracking enabled
- [ ] Monitoring alerts set up

---

## Next Steps

1. Create corresponding API routes for each service
2. Build React components for user interactions
3. Integrate with existing checkout flow
4. Set up automated emails and notifications
5. Configure external services (currency, email, tracking)
6. Run comprehensive testing
7. Deploy with monitoring

---

**Total Infrastructure:** 11 services, 1000+ lines of production code, complete e-commerce feature set.
