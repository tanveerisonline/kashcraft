# Kashcraft Phase 9-13 Database Schema

Complete Prisma schema for all advanced e-commerce features.

---

## Overview

**New Models:** 24 tables covering inventory, tracking, search, loyalty, commerce, and content

**Service Dependencies:**

- RealTimeInventoryService → Inventory, InventoryReservation, InventoryLog
- OrderTrackingService → OrderTracking, TrackingEvent
- AdvancedSearchService → SearchHistory
- LoyaltyProgramService → LoyaltyAccount, PointsHistory
- GiftCardVoucherService → GiftCard, GiftCardUsage, Voucher, VoucherUsage
- QuickBuyService → SavedPaymentMethod, SavedAddress, QuickCheckoutSession
- BlogContentService → BlogCategory, BlogPost
- SizeGuideService → SizeGuide
- SavedComparisonService → SavedComparison
- ProductWaitlistService → Waitlist

---

## Complete Prisma Schema

```prisma
// ============================================
// INVENTORY MANAGEMENT
// ============================================

model Inventory {
  id        String @id @default(cuid())
  productId String @unique
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  // Stock tracking
  sku       String?
  quantity  Int @default(0)
  reserved  Int @default(0)
  available Int @default(0)

  // Settings
  reorderLevel Int @default(10)
  reorderQuantity Int @default(50)
  warehouseLocation String?

  // Tracking
  lastRestocked DateTime?
  lastReserved DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  reservations InventoryReservation[]
  logs InventoryLog[]

  @@index([productId])
  @@index([quantity])
}

model InventoryReservation {
  id String @id @default(cuid())

  // Product reference
  inventory Inventory @relation(fields: [productId], references: [productId], onDelete: Cascade)
  productId String

  // Reservation details
  quantity Int
  orderId String
  userId String?

  // Status & timing
  status String @default("active") // active, released, confirmed
  expiresAt DateTime
  createdAt DateTime @default(now())
  releasedAt DateTime?

  @@index([orderId])
  @@index([expiresAt])
  @@index([status])
}

model InventoryLog {
  id String @id @default(cuid())

  // Product reference
  inventory Inventory @relation(fields: [productId], references: [productId], onDelete: Cascade)
  productId String

  // Change details
  quantityChange Int
  newQuantity Int
  reason String // "purchase", "restock", "adjustment", "return", "damage"

  // Context
  userId String?
  orderId String?
  notes String?

  // Timestamp
  createdAt DateTime @default(now())

  @@index([productId])
  @@index([reason])
  @@index([createdAt])
}

// ============================================
// ORDER TRACKING
// ============================================

model OrderTracking {
  id String @id @default(cuid())

  // Order reference
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId String @unique

  // Shipment information
  trackingNumber String @unique
  carrier String // "fedex", "ups", "dhl", "usps", etc
  shippingLabel String?

  // Status
  currentStatus String // "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"
  estimatedDelivery DateTime?
  actualDelivery DateTime?
  lastUpdated DateTime @default(now())

  // Carrier details
  carrierTrackingUrl String?
  carrierStatusCode String?

  // Timing
  processedAt DateTime?
  shippedAt DateTime?
  deliveredAt DateTime?

  // Metadata
  weight Decimal?
  dimensions String?
  notes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  events TrackingEvent[]
  notifications TrackingNotification[]

  @@index([orderId])
  @@index([trackingNumber])
  @@index([carrier])
  @@index([currentStatus])
  @@index([estimatedDelivery])
}

model TrackingEvent {
  id String @id @default(cuid())

  // Tracking reference
  tracking OrderTracking @relation(fields: [orderId], references: [orderId], onDelete: Cascade)
  orderId String

  // Event details
  status String // "pending", "confirmed", "picked", "in_transit", "out_for_delivery", "delivered"
  statusType String // "info", "warning", "success"
  timestamp DateTime @default(now())

  // Location & description
  location String?
  city String?
  state String?
  country String?
  description String

  // Carrier data
  carrierEventCode String?
  trackingNumber String?

  // Metadata
  sequenceNumber Int @default(0)
  isDelivered Boolean @default(false)

  @@index([orderId])
  @@index([status])
  @@index([timestamp])
}

model TrackingNotification {
  id String @id @default(cuid())

  // Tracking reference
  tracking OrderTracking @relation(fields: [orderId], references: [orderId], onDelete: Cascade)
  orderId String

  // Notification
  type String // "sms", "email", "push"
  recipient String
  subject String?
  message String

  // Status
  status String @default("pending") // "pending", "sent", "failed"
  sentAt DateTime?
  failureReason String?

  // Metadata
  eventType String?
  metadata String? // JSON

  createdAt DateTime @default(now())

  @@index([orderId])
  @@index([status])
}

// ============================================
// SEARCH & DISCOVERY
// ============================================

model SearchHistory {
  id String @id @default(cuid())

  // User reference
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  // Search details
  query String
  queryType String @default("text") // "text", "category", "filter"
  filters String? // JSON

  // Results
  resultCount Int @default(0)
  clickedProduct String?
  clickPosition Int?

  // Engagement
  durationSeconds Int @default(0)
  hadResults Boolean @default(false)
  convertedToOrder Boolean @default(false)
  orderId String?

  // Metadata
  ipAddress String?
  userAgent String?

  // Timestamp
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([query])
  @@index([timestamp])
  @@index([convertedToOrder])
}

// ============================================
// LOYALTY PROGRAM
// ============================================

model LoyaltyAccount {
  id String @id @default(cuid())

  // User reference
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String @unique

  // Tier & points
  currentTier String @default("bronze") // "bronze", "silver", "gold", "platinum"
  totalPoints Int @default(0)
  availablePoints Int @default(0)

  // Spending
  totalSpent Decimal @default(0)
  totalPurchases Int @default(0)
  averageOrderValue Decimal @default(0)

  // Birthday & anniversary
  birthDay Int?
  birthMonth Int?
  birthYearLastRedeemed Int?

  // Status
  memberSince DateTime @default(now())
  lastPurchaseDate DateTime?
  inactiveDate DateTime?

  // Metrics
  tierReachedAt DateTime?
  nextTierProjectedDate DateTime?
  statusRiskLevel String? // "safe", "at_risk", "inactive"

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  pointsHistory PointsHistory[]
  rewards LoyaltyReward[]

  @@index([userId])
  @@index([currentTier])
  @@index([totalPoints])
  @@index([lastPurchaseDate])
}

model PointsHistory {
  id String @id @default(cuid())

  // Account reference
  account LoyaltyAccount @relation(fields: [userId], references: [userId], onDelete: Cascade)
  userId String

  // Transaction
  pointsAmount Int
  pointsType String // "earn", "redeem", "adjustment", "bonus", "expiration"

  // Source
  sourceType String // "purchase", "signup", "referral", "review", "birthday"
  sourceId String? // orderId, referralId, reviewId, etc

  // Metadata
  multiplier Decimal @default(1)
  baseAmount Decimal?
  reason String?
  notes String?

  // Expiration
  expiresAt DateTime?
  isExpired Boolean @default(false)

  // Timestamp
  createdAt DateTime @default(now())
  expiredAt DateTime?

  @@index([userId])
  @@index([pointsType])
  @@index([sourceType])
  @@index([createdAt])
  @@index([expiresAt])
}

model LoyaltyReward {
  id String @id @default(cuid())

  // Account reference
  account LoyaltyAccount @relation(fields: [userId], references: [userId], onDelete: Cascade)
  userId String

  // Reward
  name String
  description String?
  rewardType String // "discount", "free_shipping", "free_item", "vip_upgrade"
  value Decimal

  // Status
  status String @default("available") // "available", "redeemed", "expired"

  // Conditions
  minTierRequired String?
  expiresAt DateTime?

  // Redemption
  redeemedAt DateTime?
  redeemedAt DateTime?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([status])
}

// ============================================
// GIFT CARDS & VOUCHERS
// ============================================

model GiftCard {
  id String @id @default(cuid())

  // Identification
  code String @unique
  sku String?

  // Value
  initialValue Decimal
  currentBalance Decimal

  // Status
  status String @default("active") // "active", "used", "expired", "cancelled"

  // Dates
  expiresAt DateTime
  purchasedAt DateTime @default(now())
  firstUsedAt DateTime?
  fullyUsedAt DateTime?

  // Purchaser & recipient
  purchasedBy String?
  purchasedByEmail String?
  recipientName String?
  recipientEmail String?

  // Metadata
  notes String?
  customMessage String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  usage GiftCardUsage[]

  @@index([code])
  @@index([status])
  @@index([expiresAt])
}

model GiftCardUsage {
  id String @id @default(cuid())

  // Gift card reference
  giftCard GiftCard @relation(fields: [giftCardId], references: [id], onDelete: Cascade)
  giftCardId String

  // Usage
  order Order? @relation(fields: [orderId], references: [id], onDelete: SetNull)
  orderId String?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId String?

  // Amount
  amountUsed Decimal

  // Metadata
  notes String?

  createdAt DateTime @default(now())

  @@index([giftCardId])
  @@index([orderId])
  @@index([userId])
}

model Voucher {
  id String @id @default(cuid())

  // Identification
  code String @unique
  name String
  description String?

  // Discount
  discountType String // "percentage", "fixed"
  discountValue Decimal
  maxDiscount Decimal? // For percentage discounts
  minDiscount Decimal? // For fixed discounts

  // Conditions
  minOrderValue Decimal @default(0)
  maxOrderValue Decimal?
  applicableCategories String? // JSON array
  excludedProducts String? // JSON array

  // Usage limits
  maxUsages Int?
  maxUsagePerUser Int @default(1)
  currentUsages Int @default(0)

  // Dates
  startDate DateTime
  expiresAt DateTime

  // Status
  isActive Boolean @default(true)
  requiresCode Boolean @default(true)

  // Metadata
  createdBy String?
  campaign String?
  notes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  usage VoucherUsage[]

  @@index([code])
  @@index([isActive])
  @@index([expiresAt])
}

model VoucherUsage {
  id String @id @default(cuid())

  // Voucher reference
  voucher Voucher @relation(fields: [voucherId], references: [id], onDelete: Cascade)
  voucherId String

  // Usage
  order Order? @relation(fields: [orderId], references: [id], onDelete: SetNull)
  orderId String?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId String?

  // Discount applied
  discountAmount Decimal
  orderTotal Decimal
  finalTotal Decimal

  // Metadata
  appliedAt DateTime @default(now())

  @@index([voucherId])
  @@index([orderId])
  @@index([userId])
}

// ============================================
// QUICK CHECKOUT
// ============================================

model SavedPaymentMethod {
  id String @id @default(cuid())

  // User reference
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  // Payment details
  type String // "credit_card", "paypal", "apple_pay", "google_pay"

  // Card-specific
  token String // Encrypted token from payment processor
  last4 String? // Last 4 digits for display
  cardholderName String?
  expiryMonth Int?
  expiryYear Int?
  brand String? // "visa", "mastercard", "amex"

  // Digital wallet
  walletEmail String?
  walletId String?

  // Status
  isDefault Boolean @default(false)
  isVerified Boolean @default(true)

  // Metadata
  billingZip String?
  billingCountry String?

  // Tracking
  lastUsedAt DateTime?
  failedAttempts Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  quickCheckoutSessions QuickCheckoutSession[]

  @@index([userId])
  @@index([isDefault])
  @@unique([userId, isDefault]) // Only one default per user per type
}

model SavedAddress {
  id String @id @default(cuid())

  // User reference
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  // Address type
  type String // "shipping", "billing"
  label String? // "Home", "Work", "Apartment"

  // Contact
  fullName String
  phone String?
  email String?

  // Address
  streetAddress String
  streetAddress2 String?
  city String
  state String
  postalCode String
  country String

  // Status
  isDefault Boolean @default(false)
  isPrimary Boolean @default(false)
  isResidential Boolean @default(true)

  // Validation
  isVerified Boolean @default(false)
  verificationStatus String? // "pending", "verified", "failed"

  // Tracking
  lastUsedAt DateTime?
  usageCount Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  quickCheckoutSessions QuickCheckoutSession[]

  @@index([userId])
  @@index([type])
  @@index([isDefault])
  @@index([country])
}

model QuickCheckoutSession {
  sessionId String @id @default(cuid())

  // User reference
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  // Product details
  productId String
  quantity Int

  // Payment & shipping
  paymentMethod SavedPaymentMethod @relation(fields: [paymentMethodId], references: [id], onDelete: Cascade)
  paymentMethodId String

  shippingAddress SavedAddress @relation(fields: [shippingAddressId], references: [id], onDelete: Cascade)
  shippingAddressId String

  billingAddressId String?

  // Pricing
  subtotal Decimal?
  shippingCost Decimal?
  taxAmount Decimal?
  totalAmount Decimal?

  // Status
  status String @default("active") // "active", "completed", "cancelled", "expired"

  // Completion
  orderId String?
  completedAt DateTime?

  // Expiration (30 minutes typically)
  expiresAt DateTime
  isExpired Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([expiresAt])
}

// ============================================
// BLOG & CONTENT
// ============================================

model BlogCategory {
  id String @id @default(cuid())

  // Content
  name String
  slug String @unique
  description String?

  // Content
  image String?
  seoTitle String?
  seoDescription String?

  // Status
  isActive Boolean @default(true)

  // Metadata
  postCount Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts BlogPost[]

  @@index([slug])
  @@index([isActive])
}

model BlogPost {
  id String @id @default(cuid())

  // Content
  title String
  slug String @unique
  content String // HTML or Markdown
  excerpt String

  // Metadata
  author String
  category BlogCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String

  tags String? // JSON array of tags

  // Media
  image String? // Hero image
  imageAlt String?

  // Status
  status String @default("draft") // "draft", "published", "archived"
  featured Boolean @default(false)

  // SEO
  seoTitle String?
  seoDescription String?
  seoKeywords String? // JSON array

  // Statistics
  viewCount Int @default(0)
  viewsLastMonth Int @default(0)
  viewsLastWeek Int @default(0)

  likes Int @default(0)
  comments Int @default(0)
  shares Int @default(0)

  // Engagement
  readingTimeMinutes Int?
  wordCount Int @default(0)

  // Publishing
  publishedAt DateTime?
  scheduledFor DateTime?

  // Tracking
  updatedBy String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([status])
  @@index([categoryId])
  @@index([publishedAt])
  @@index([featured])
  @@index([viewCount])
}

// ============================================
// PRODUCT FEATURES
// ============================================

model SizeGuide {
  id String @id @default(cuid())

  // Scope
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  productId String?
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  categoryId String?

  // Content
  name String
  description String?

  // Measurements (JSON array)
  measurements String // JSON: [{ size: 'S', chest: 36, waist: 30, ... }, ...]

  // Fit guidance
  fitDescription String?
  fitImages String? // JSON array of image URLs

  // Conversions (JSON object)
  conversionCharts String? // JSON: { US: [...], EU: [...], UK: [...] }

  // Metadata & usage
  usageCount Int @default(0)
  lastViewedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([productId])
  @@index([categoryId])
}

model SavedComparison {
  id String @id @default(cuid())

  // User reference
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  // Comparison
  name String
  productIds String // JSON array of product IDs

  // Details
  description String?
  productCount Int @default(0)

  // Metadata
  isPublic Boolean @default(false)
  shareToken String? // For sharing without authentication

  // Tracking
  viewCount Int @default(0)
  lastViewedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([isPublic])
}

model Waitlist {
  id String @id @default(cuid())

  // References
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String

  // Contact
  email String
  phone String?

  // Status
  status String @default("active") // "active", "notified", "purchased", "cancelled"

  // Notification
  notifiedAt DateTime?
  notificationMethod String? // "email", "sms", "both"

  // Metadata
  position Int? // Position in queue
  addedAt DateTime @default(now())
  waitDate Int @default(0) // Days waiting

  // Preferences
  allowNotifications Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
  @@index([userId])
  @@index([productId])
  @@index([status])
  @@index([notifiedAt])
}

// ============================================
// RELATIONS TO EXISTING MODELS
// ============================================
// These fields should be added to existing models:

// In User model:
// - loyaltyAccount LoyaltyAccount?
// - pointsHistory PointsHistory[]
// - searchHistory SearchHistory[]
// - savedPaymentMethods SavedPaymentMethod[]
// - savedAddresses SavedAddress[]
// - quickCheckoutSessions QuickCheckoutSession[]
// - giftCardUsages GiftCardUsage[]
// - voucherUsages VoucherUsage[]
// - savedComparisons SavedComparison[]
// - waitlist Waitlist[]

// In Product model:
// - inventory Inventory?
// - sizeGuide SizeGuide?
// - waitlist Waitlist[]
// - comparisons SavedComparison[]

// In Category model:
// - sizeGuide SizeGuide?

// In Order model:
// - tracking OrderTracking?
// - giftCardUsages GiftCardUsage[]
// - voucherUsages VoucherUsage[]
```

---

## Migration Guide

### Step 1: Add New Fields to Existing Models

Update your existing `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields ...

  // Add these relations for Phase 9-13 features
  loyaltyAccount LoyaltyAccount?
  pointsHistory PointsHistory[]
  searchHistory SearchHistory[]
  savedPaymentMethods SavedPaymentMethod[]
  savedAddresses SavedAddress[]
  quickCheckoutSessions QuickCheckoutSession[]
  giftCardUsages GiftCardUsage[]
  voucherUsages VoucherUsage[]
  savedComparisons SavedComparison[]
  waitlist Waitlist[]
}

model Product {
  // ... existing fields ...

  // Add these relations for Phase 9-13 features
  inventory Inventory?
  sizeGuide SizeGuide?
  waitlist Waitlist[]
  comparisons SavedComparison[]
}

model Category {
  // ... existing fields ...

  sizeGuide SizeGuide?
  blogCategory BlogCategory? // If separate, or just add blog category relation
}

model Order {
  // ... existing fields ...

  tracking OrderTracking?
  giftCardUsages GiftCardUsage[]
  voucherUsages VoucherUsage[]
}
```

### Step 2: Create Migration

```bash
npx prisma migrate dev --name add_phase9_advanced_features
```

### Step 3: Verify Schema

```bash
npx prisma db push
npx prisma generate
```

---

## Data Relationships Diagram

```
User
├── LoyaltyAccount → PointsHistory
├── SearchHistory
├── SavedPaymentMethod → QuickCheckoutSession
├── SavedAddress → QuickCheckoutSession
├── GiftCardUsage ← GiftCard
├── VoucherUsage ← Voucher
├── SavedComparison
└── Waitlist ← Product

Product
├── Inventory → InventoryReservation, InventoryLog
├── SizeGuide
├── Waitlist
└── Category
    └── BlogCategory → BlogPost

Order
├── OrderTracking → TrackingEvent, TrackingNotification
├── GiftCardUsage
└── VoucherUsage
```

---

## Index Strategy

**High-Traffic Indexes:**

- `SearchHistory(userId, query, timestamp)`
- `OrderTracking(orderId, trackingNumber, currentStatus)`
- `LoyaltyAccount(userId, currentTier, totalPoints)`
- `SavedPaymentMethod(userId, isDefault)`
- `SavedAddress(userId, type, isDefault)`
- `Waitlist(productId, status, createdAt)`
- `BlogPost(slug, status, publishedAt)`

**Query Performance:**

- All indexes on foreign keys (default Prisma behavior)
- Composite indexes on frequently filtered combinations
- Index on `expiresAt` for cleanup jobs

---

## Cleanup Jobs

### Inventory Reservation Expiry

```sql
DELETE FROM InventoryReservation
WHERE status = 'active' AND expiresAt < NOW();
```

### Expired Gift Cards

```sql
UPDATE GiftCard
SET status = 'expired'
WHERE expiresAt < NOW() AND status = 'active';
```

### Expired Vouchers

```sql
UPDATE Voucher
SET isActive = false
WHERE expiresAt < NOW() AND isActive = true;
```

### Expired Loyalty Points

```sql
UPDATE PointsHistory
SET isExpired = true
WHERE expiresAt < NOW() AND isExpired = false;
```

### Old Waitlist Entries

```sql
DELETE FROM Waitlist
WHERE status IN ('notified', 'cancelled')
AND updatedAt < (NOW() - INTERVAL 30 DAY);
```

### Expired Quick Checkout Sessions

```sql
DELETE FROM QuickCheckoutSession
WHERE status = 'active' AND expiresAt < NOW();
```

---

## Constraints & Validation

**Unique Constraints:**

- `Inventory.productId` (one per product)
- `GiftCard.code` (codes must be unique)
- `Voucher.code` (codes must be unique)
- `OrderTracking.trackingNumber` (unique per order)
- `BlogPost.slug` (URL-friendly slugs)
- `BlogCategory.slug` (URL-friendly category slugs)
- `SizeGuide` (product + category can't both be set, one must be null or unique combo)
- `Waitlist(userId, productId)` (one per user per product)

**Cascade Delete Strategy:**

- User deleted → all related records deleted (loyalty, search, addresses, payments, etc)
- Product deleted → inventory, size guide, comparisons, waitlist deleted
- Order deleted → tracking, gift card usage, voucher usage deleted

---

## Performance Considerations

**Read-Heavy Tables:** SearchHistory, BlogPost, TrackingEvent

- Add read replicas if using managed database
- Cache frequently accessed (SearchHistory, BlogPost popular)

**Write-Heavy Tables:** InventoryLog, PointsHistory, TrackingEvent

- Consider async writes for non-critical fields
- Archive old logs periodically

**Archive Strategy:**

- Move inventory logs >90 days old to archive table
- Archive old tracking events >6 months
- Compress blog view statistics
