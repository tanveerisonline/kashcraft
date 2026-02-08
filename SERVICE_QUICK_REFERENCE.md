# Service Quick Reference

## API Methods & Usage Guide

Quick reference for all 13 services and their methods.

---

## 1. RealTimeInventoryService

**File:** `src/lib/services/inventory/real-time-inventory.service.ts`
**Import:** `import { realTimeInventoryService } from '@/lib/services';`

### Singleton Pattern

```typescript
// Access the service
const service = realTimeInventoryService;
```

### Core Methods

| Method                                           | Params                   | Returns       | Use Case                |
| ------------------------------------------------ | ------------------------ | ------------- | ----------------------- |
| `getStockLevel(productId)`                       | `string`                 | `StockLevel`  | Display current stock   |
| `updateInventory(productId, quantity, reason)`   | `string, number, string` | `Inventory`   | Update stock quantity   |
| `reserveInventory(productId, quantity, orderId)` | `string, number, string` | `Reservation` | Reserve during checkout |
| `releaseReservation(reservationId)`              | `string`                 | `boolean`     | Cancel reservation      |
| `confirmInventory(reservationId)`                | `string`                 | `boolean`     | Convert to sale         |
| `getLowStockProducts()`                          | none                     | `Product[]`   | Dashboard alerts        |
| `getInventoryMetrics()`                          | none                     | `Metrics`     | Analytics dashboard     |

### Events Emitted

```typescript
realTimeInventoryService.on('inventory-updated', (data) => { ... });
realTimeInventoryService.on('low-stock-warning', (data) => { ... });
```

### Example Usage

```typescript
// Check if product is in stock
const stock = await realTimeInventoryService.getStockLevel("prod_123");
if (stock.available > 0) {
  // Reserve for order
  const reservation = await realTimeInventoryService.reserveInventory("prod_123", 1, "ord_456");
}
```

---

## 2. AdvancedSearchService

**File:** `src/lib/services/search/advanced-search.service.ts`
**Import:** `import { advancedSearchService } from '@/lib/services';`

### Core Methods

| Method                                        | Params                   | Returns           | Use Case                  |
| --------------------------------------------- | ------------------------ | ----------------- | ------------------------- |
| `search(options)`                             | `SearchOptions`          | `SearchResults`   | Full search with filters  |
| `getFacet(field)`                             | `string`                 | `Facet`           | Get facet values/counts   |
| `getSuggestions(query)`                       | `string`                 | `string[]`        | Auto-complete suggestions |
| `getSearchHistory(userId)`                    | `string`                 | `HistoryEntry[]`  | User's past searches      |
| `getPopularSearches()`                        | none                     | `PopularSearch[]` | Trending searches         |
| `recordSearchClick(userId, query, productId)` | `string, string, string` | `boolean`         | Track engagement          |

### Example Usage

```typescript
// Advanced search with filters
const results = await advancedSearchService.search({
  query: "blue shirt",
  filters: [
    { field: "category", values: ["clothing"] },
    { field: "price", values: { min: 20, max: 100 } },
  ],
  sortBy: "price_asc",
  page: 1,
  limit: 20,
  userId: "user_123",
});

// Get suggestions
const suggestions = await advancedSearchService.getSuggestions("blue");
```

---

## 3. RecommendationEngine

**File:** `src/lib/services/recommendations/recommendation.service.ts`
**Import:** `import { recommendationEngine } from '@/lib/services';`

### Core Methods

| Method                                          | Params            | Returns              | Use Case          |
| ----------------------------------------------- | ----------------- | -------------------- | ----------------- |
| `getFrequentlyBoughtTogether(productId, limit)` | `string, number?` | `Product[]`          | "People also buy" |
| `getSimilarProducts(productId, limit)`          | `string, number?` | `Product[]`          | Similar items     |
| `getPersonalizedRecommendations(userId, limit)` | `string, number?` | `Product[]`          | User-based        |
| `getTrendingProducts(limit)`                    | `number?`         | `Product[]`          | Hot items         |
| `getProductRecommendations(productId, userId)`  | `string, string`  | `AllRecommendations` | Multi-algorithm   |
| `getHomepageRecommendations(userId)`            | `string?`         | `HomepageRecs`       | Curated homepage  |

### Example Usage

```typescript
// Get all recommendations for product detail page
const recs = await recommendationEngine.getProductRecommendations("prod_123", "user_456");

// Or each type separately
const fbt = await recommendationEngine.getFrequentlyBoughtTogether("prod_123", 5);
const similar = await recommendationEngine.getSimilarProducts("prod_123", 5);
```

---

## 4. EmailMarketingService

**File:** `src/lib/services/marketing/email-marketing.service.ts`
**Import:** `import { emailMarketingService } from '@/lib/services';`

### Core Methods

| Method                                              | Params                           | Returns      | Use Case           |
| --------------------------------------------------- | -------------------------------- | ------------ | ------------------ |
| `sendWelcomeEmail(email, firstName)`                | `string, string`                 | `SendResult` | New user signup    |
| `sendAbandonedCartEmail(email, items, total, link)` | `string, Item[], number, string` | `SendResult` | Cart recovery      |
| `sendOrderConfirmationEmail(email, order)`          | `string, Order`                  | `SendResult` | After purchase     |
| `sendShipmentEmail(email, tracking)`                | `string, TrackingInfo`           | `SendResult` | Shipment update    |
| `sendNewsletter(subscriberList, subject, html)`     | `string[], string, string`       | `SendResult` | Bulk campaign      |
| `addSubscriber(email, firstName?, lastName?)`       | `string, string?, string?`       | `Subscriber` | Newsletter signup  |
| `unsubscribeEmail(email)`                           | `string`                         | `boolean`    | Unsubscribe        |
| `getCampaignStats()`                                | none                             | `Stats`      | Campaign analytics |

### Configuration

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=sg_...
MAILCHIMP_API_KEY=...
EMAIL_FROM=noreply@kashcraft.com
```

### Example Usage

```typescript
// Send welcome email
await emailMarketingService.sendWelcomeEmail("user@example.com", "John");

// Send abandoned cart (call from cart timeout)
await emailMarketingService.sendAbandonedCartEmail(
  "user@example.com",
  cartItems,
  99.99,
  "https://kashcraft.com/recover?cart=123"
);

// Send order confirmation (call from order service)
await emailMarketingService.sendOrderConfirmationEmail("user@example.com", orderData);
```

---

## 5. OrderTrackingService

**File:** `src/lib/services/orders/order-tracking.service.ts`
**Import:** `import { orderTrackingService } from '@/lib/services';`

### Core Methods

| Method                                                                | Params                             | Returns           | Use Case         |
| --------------------------------------------------------------------- | ---------------------------------- | ----------------- | ---------------- |
| `createTracking(orderId, trackingNumber, carrier, estimatedDelivery)` | `string, string, string, Date`     | `OrderTracking`   | When order ships |
| `updateOrderStatus(orderId, status, reason?, notes?)`                 | `string, string, string?, string?` | `OrderTracking`   | Status update    |
| `getTrackingInfo(orderId)`                                            | `string`                           | `OrderTracking`   | Current status   |
| `getTrackingHistory(orderId)`                                         | `string`                           | `TrackingEvent[]` | Full event log   |
| `getTrackingByNumber(trackingNumber)`                                 | `string`                           | `OrderTracking`   | Public lookup    |
| `updateFromCarrier(trackingNumber, carrierUpdate)`                    | `string, object`                   | `OrderTracking`   | Carrier webhook  |
| `getPendingDeliveries()`                                              | none                               | `Order[]`         | 7-day forecast   |
| `getDeliveryMetrics()`                                                | none                               | `Metrics`         | KPI dashboard    |

### Statuses

```typescript
"pending" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered";
```

### Example Usage

```typescript
// Create tracking when order ships
await orderTrackingService.createTracking(
  "ord_123",
  "FX123456789",
  "fedex",
  new Date("2024-01-10")
);

// Get tracking info for customer
const tracking = await orderTrackingService.getTrackingInfo("ord_123");

// Handle carrier webhook
app.post("/webhooks/tracking", async (req, res) => {
  await orderTrackingService.updateFromCarrier("FX123456789", req.body);
});
```

---

## 6. GiftCardVoucherService

**File:** `src/lib/services/ecommerce/gift-card-voucher.service.ts`
**Import:** `import { giftCardVoucherService } from '@/lib/services';`

### Core Methods

| Method                                              | Params                           | Returns         | Use Case             |
| --------------------------------------------------- | -------------------------------- | --------------- | -------------------- |
| `createGiftCard(initialValue, expiryDays?)`         | `number, number?`                | `GiftCard`      | Single card creation |
| `bulkCreateGiftCards(quantity, value, expiryDays?)` | `number, number, number?`        | `GiftCard[]`    | Campaign cards       |
| `getGiftCard(code)`                                 | `string`                         | `GiftCard`      | Get card details     |
| `validateGiftCard(code, amount?)`                   | `string, number?`                | `boolean`       | Checkout validation  |
| `redeemGiftCard(code, orderId, userId, amount)`     | `string, string, string, number` | `GiftCardUsage` | Apply card           |
| `checkBalance(code)`                                | `string`                         | `number`        | Public balance       |
| `cancelGiftCard(code, reason)`                      | `string, string`                 | `boolean`       | Revoke card          |
| `createVoucher(type, value, maxUsages, expiryDays)` | `string, number, number, number` | `Voucher`       | Promo code           |
| `validateVoucher(code, orderValue)`                 | `string, number`                 | `VoucherResult` | Checkout validation  |
| `applyVoucher(code, orderId)`                       | `string, string`                 | `VoucherUsage`  | Apply code           |
| `getVoucherStats(voucherId)`                        | `string`                         | `Stats`         | Campaign performance |

### Formats

- Gift Card: `GC-XXXX-XXXX-XXXX-XXXX`
- Voucher: `VC-XXXXXX`

### Example Usage

```typescript
// Create single gift card
const card = await giftCardVoucherService.createGiftCard(100, 365);
// → { code: 'GC-XXXX-XXXX-XXXX-XXXX', balance: 100, ... }

// Bulk create for holiday campaign
const cards = await giftCardVoucherService.bulkCreateGiftCards(
  100, // quantity
  50, // $50 each
  365 // expires in 365 days
);

// Validate in checkout
const valid = await giftCardVoucherService.validateGiftCard("GC-XXXX-XXXX-XXXX-XXXX");

// Redeem on order
await giftCardVoucherService.redeemGiftCard(
  "GC-XXXX-XXXX-XXXX-XXXX",
  "ord_123",
  "user_456",
  75.5 // amount to redeem
);

// Create promotional voucher
const voucher = await giftCardVoucherService.createVoucher(
  "percentage", // type: 'percentage' or 'fixed'
  15, // 15% off
  500, // max 500 usages
  30 // expires in 30 days
);

// Validate voucher in checkout
const voucherResult = await giftCardVoucherService.validateVoucher("VC-XXXXXX", 100);
// → { valid: true, discountType: 'percentage', discountValue: 15, estimatedDiscount: 15 }
```

---

## 7. LoyaltyProgramService

**File:** `src/lib/services/loyalty/loyalty-program.service.ts`
**Import:** `import { loyaltyProgramService } from '@/lib/services';`

### Tiers & Benefits

| Tier     | Min Points | Points Multiplier | Benefits                                                    |
| -------- | ---------- | ----------------- | ----------------------------------------------------------- |
| Bronze   | 0          | 1x                | Birthday bonus (50 pts)                                     |
| Silver   | 500        | 1.25x             | Free shipping $50+, Birthday (100 pts)                      |
| Gold     | 2000       | 1.5x              | 10% off all, Free shipping, Birthday (200 pts)              |
| Platinum | 5000       | 2x                | 15% off all, 2-day shipping, Birthday (500 pts), VIP events |

### Core Methods

| Method                                               | Params                   | Returns            | Use Case        |
| ---------------------------------------------------- | ------------------------ | ------------------ | --------------- |
| `initializeAccount(userId)`                          | `string`                 | `LoyaltyAccount`   | New member      |
| `getAccount(userId)`                                 | `string`                 | `LoyaltyAccount`   | User profile    |
| `addPointsForPurchase(userId, orderAmount, orderId)` | `string, number, string` | `number`           | After order     |
| `redeemPoints(userId, points)`                       | `string, number`         | `Discount`         | Convert points  |
| `getPointsHistory(userId, limit?)`                   | `string, number?`        | `PointsHistory[]`  | Transaction log |
| `getTierBenefits(tierName)`                          | `string`                 | `TierBenefits`     | Tier details    |
| `getAllTiers()`                                      | none                     | `Tier[]`           | All tier info   |
| `addReferralBonus(referrerId, refereeId)`            | `string, string`         | `boolean`          | Share & earn    |
| `addReviewBonus(userId, productId)`                  | `string, string`         | `number`           | After review    |
| `getTopMembers(limit?)`                              | `number?`                | `LoyaltyAccount[]` | Leaderboard     |
| `getLoyaltySummary()`                                | none                     | `Summary`          | Global stats    |

### Points System

- 1 point = $0.01 redemption value
- Purchase: 1 point per $1 spent (multiplied by tier)
- Signup: 100 points
- Referral: 100 points each direction
- Review: 10 points per review (1 per product)
- Birthday: 50-500 points depending on tier

### Example Usage

```typescript
// Initialize new member
const account = await loyaltyProgramService.initializeAccount("user_123");

// Add points after purchase
const points = await loyaltyProgramService.addPointsForPurchase("user_123", 99.99, "ord_456");

// Get account with tier info
const account = await loyaltyProgramService.getAccount("user_123");
// → {
//   tier: 'silver',
//   totalPoints: 1250,
//   availablePoints: 500,
//   totalSpent: 1250,
//   tierProgress: 62.5
// }

// Redeem points
const discount = await loyaltyProgramService.redeemPoints("user_123", 100);
// → { pointsRedeemed: 100, discountAmount: 1.00 }

// Add referral bonus
await loyaltyProgramService.addReferralBonus("user_123", "user_789");
```

---

## 8. MultiCurrencyService

**File:** `src/lib/services/localization/multi-currency.service.ts`
**Import:** `import { multiCurrencyService } from '@/lib/services';`

### Supported Currencies

USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR

### Core Methods

| Method                                       | Params                   | Returns      | Use Case      |
| -------------------------------------------- | ------------------------ | ------------ | ------------- |
| `getCurrencies()`                            | none                     | `Currency[]` | All available |
| `getCurrency(code)`                          | `string`                 | `Currency`   | Lookup        |
| `convertCurrency(amount, from, to)`          | `number, string, string` | `Conversion` | Convert       |
| `formatPrice(amount, currencyCode)`          | `number, string`         | `string`     | Display       |
| `detectUserCurrency(ipAddress?)`             | `string?`                | `string`     | Auto-detect   |
| `getExchangeRates(baseCurrency?)`            | `string?`                | `Rates`      | All rates     |
| `updateExchangeRates()`                      | none                     | `boolean`    | Manual update |
| `addCurrency(code, symbol, rate)`            | `string, string, number` | `boolean`    | Add new       |
| `getPriceInCurrency(amount, targetCurrency)` | `number, string`         | `PriceInfo`  | Product price |

### Symbols & Positioning

```typescript
// Symbol before: $ £ € ¥ C$ A$ ₹
// Symbol after: CHF

// Examples:
// USD: $99.99
// EUR: €92.00
// GBP: £78.00
// JPY: ¥11050
```

### Example Usage

```typescript
// Convert amount
const conversion = multiCurrencyService.convertCurrency(100, "USD", "EUR");
// → { from: 'USD', to: 'EUR', amount: 100, rate: 0.92, convertedAmount: 92 }

// Format price for display
const formatted = multiCurrencyService.formatPrice(99.99, "USD");
// → '$99.99'

// Detect user's currency
const currency = await multiCurrencyService.detectUserCurrency("203.0.113.1");
// → 'USD'

// Get product price in other currencies
const price = multiCurrencyService.getPriceInCurrency(100, "EUR");
// → { price: 92, formatted: '€92.00', originalPrice: 100 }
```

---

## 9. SizeGuideService

**File:** `src/lib/services/products/size-guide.service.ts`
**Import:** `import { sizeGuideService } from '@/lib/services';`

### Core Methods

| Method                                                         | Params                                    | Returns          | Use Case        |
| -------------------------------------------------------------- | ----------------------------------------- | ---------------- | --------------- |
| `getSizeGuideForProduct(productId)`                            | `string`                                  | `SizeGuide`      | Product page    |
| `createSizeGuide(name, measurements, categoryId?, productId?)` | `string, Measurement[], string?, string?` | `SizeGuide`      | Admin creation  |
| `addConversionChart(guideId, conversions)`                     | `string, Conversions`                     | `SizeGuide`      | Add sizes       |
| `getSizeRecommendation(guideId, userMeasurements)`             | `string, object`                          | `Recommendation` | Find best size  |
| `convertSize(size, fromSystem, toSystem)`                      | `string, string, string`                  | `string`         | Size conversion |
| `getPopularSizeGuides(limit?)`                                 | `number?`                                 | `SizeGuide[]`    | Most used       |

### Size Systems

`US`, `EU`, `UK`

### Example Usage

```typescript
// Get size guide for product detail page
const guide = await sizeGuideService.getSizeGuideForProduct("prod_123");
// → { name: "Men's Clothing", measurements: [...], conversions: {...} }

// Get recommendation based on user measurements
const recommendation = await sizeGuideService.getSizeRecommendation("guide_123", {
  chest: 36,
  waist: 30,
  length: 28,
});
// → { recommendedSize: 'M', confidence: 0.95 }

// Convert size between systems
const euSize = sizeGuideService.convertSize("M", "US", "EU");
// → '36'
```

---

## 10. ProductComparisonService

**File:** `src/lib/services/products/product-comparison.service.ts`
**Import:** `import { productComparisonService } from '@/lib/services';`

### Core Methods

| Method                                     | Params                     | Returns             | Use Case      |
| ------------------------------------------ | -------------------------- | ------------------- | ------------- |
| `compareProducts(productIds)`              | `string[]`                 | `Comparison`        | Side-by-side  |
| `generateComparisonHTML(comparison)`       | `Comparison`               | `string`            | Print/share   |
| `generateComparisonCSV(comparison)`        | `Comparison`               | `string`            | Export        |
| `saveComparison(userId, name, productIds)` | `string, string, string[]` | `SavedComparison`   | Save for user |
| `getSavedComparison(comparisonId)`         | `string`                   | `SavedComparison`   | Load saved    |
| `getUserSavedComparisons(userId)`          | `string`                   | `SavedComparison[]` | User's list   |
| `deleteSavedComparison(comparisonId)`      | `string`                   | `boolean`           | Remove saved  |

### Constraints

- Max 4 products per comparison
- Enforced in API validation

### Example Usage

```typescript
// Compare 3 products
const comparison = await productComparisonService.compareProducts([
  "prod_123",
  "prod_456",
  "prod_789",
]);
// → { products: [...], specs: [...], differences: [...] }

// Generate HTML for printing
const html = productComparisonService.generateComparisonHTML(comparison);
// → <html>...</html>

// Save comparison for user
const saved = await productComparisonService.saveComparison("user_123", "My Comparison", [
  "prod_123",
  "prod_456",
  "prod_789",
]);

// Load saved comparison
const loaded = await productComparisonService.getSavedComparison("cmp_123");
```

---

## 11. ProductWaitlistService

**File:** `src/lib/services/products/product-waitlist.service.ts`
**Import:** `import { productWaitlistService } from '@/lib/services';`

### Core Methods

| Method                                    | Params                   | Returns           | Use Case          |
| ----------------------------------------- | ------------------------ | ----------------- | ----------------- |
| `addToWaitlist(userId, productId, email)` | `string, string, string` | `WaitlistEntry`   | Signup            |
| `removeFromWaitlist(userId, productId)`   | `string, string`         | `boolean`         | User cancel       |
| `getUserWaitlist(userId)`                 | `string`                 | `WaitlistEntry[]` | User's list       |
| `getProductWaitlist(productId)`           | `string`                 | `WaitlistEntry[]` | Product's waiters |
| `notifyWaitlist(productId, quantity?)`    | `string, number?`        | `number`          | On restock        |
| `isOnWaitlist(userId, productId)`         | `string, string`         | `boolean`         | Check membership  |
| `getWaitlistPosition(userId, productId)`  | `string, string`         | `number`          | Queue position    |
| `markAsPurchased(userId, productId)`      | `string, string`         | `boolean`         | After purchase    |
| `cleanupOldEntries()`                     | none                     | `number`          | Archive old       |
| `getWaitlistStats(productId)`             | `string`                 | `Stats`           | Product stats     |
| `getGlobalWaitlistStats()`                | none                     | `GlobalStats`     | System stats      |
| `exportWaitlistCSV(productId)`            | `string`                 | `string`          | Campaign export   |

### States

`active` | `notified` | `purchased` | `cancelled`

### Example Usage

```typescript
// Add user to waitlist
const entry = await productWaitlistService.addToWaitlist(
  "user_123",
  "prod_456",
  "user@example.com"
);

// Check if on waitlist
const isWaiting = await productWaitlistService.isOnWaitlist("user_123", "prod_456");

// Get position in queue
const position = await productWaitlistService.getWaitlistPosition("user_123", "prod_456");
// → 1 (first in queue = earliest signup)

// Send notifications when back in stock
const notifiedCount = await productWaitlistService.notifyWaitlist("prod_456");

// Get product statistics
const stats = await productWaitlistService.getWaitlistStats("prod_456");
// → { total: 150, active: 100, notified: 40, conversionRate: 0.12 }
```

---

## 12. QuickBuyService

**File:** `src/lib/services/checkout/quick-buy.service.ts`
**Import:** `import { quickBuyService } from '@/lib/services';`

### Core Methods

| Method                                                                                                      | Params            | Returns           | Use Case        |
| ----------------------------------------------------------------------------------------------------------- | ----------------- | ----------------- | --------------- |
| `savePaymentMethod(userId, type, token, last4, cardholderName, month, year, isDefault)`                     | complex           | `PaymentMethod`   | Store card      |
| `getPaymentMethods(userId)`                                                                                 | `string`          | `PaymentMethod[]` | List cards      |
| `getDefaultPaymentMethod(userId)`                                                                           | `string`          | `PaymentMethod`   | Primary card    |
| `updatePaymentMethod(methodId, updates)`                                                                    | `string, object`  | `PaymentMethod`   | Modify card     |
| `deletePaymentMethod(methodId)`                                                                             | `string`          | `boolean`         | Remove card     |
| `saveAddress(userId, type, label, fullName, street, city, state, zip, country, phone, isDefault)`           | complex           | `SavedAddress`    | Store address   |
| `getAddresses(userId, type?)`                                                                               | `string, string?` | `SavedAddress[]`  | List addresses  |
| `getDefaultAddress(userId, type)`                                                                           | `string, string`  | `SavedAddress`    | Primary address |
| `updateAddress(addressId, updates)`                                                                         | `string, object`  | `SavedAddress`    | Modify address  |
| `deleteAddress(addressId)`                                                                                  | `string`          | `boolean`         | Remove address  |
| `createQuickCheckoutSession(userId, productId, qty, paymentMethodId, shippingAddressId, billingAddressId?)` | complex           | `Session`         | Start quick buy |
| `getQuickCheckoutSession(sessionId)`                                                                        | `string`          | `Session`         | Load session    |
| `cleanupExpiredSessions()`                                                                                  | none              | `number`          | Cleanup         |

### Example Usage

```typescript
// Save payment method
const method = await quickBuyService.savePaymentMethod(
  "user_123",
  "credit_card",
  "tok_visa",
  "4242",
  "John Doe",
  12,
  2025,
  true // isDefault
);

// Get saved payment methods
const methods = await quickBuyService.getPaymentMethods("user_123");

// Save address
const address = await quickBuyService.saveAddress(
  "user_123",
  "shipping",
  "Home",
  "John Doe",
  "123 Main St",
  "Springfield",
  "IL",
  "62701",
  "US",
  "555-1234",
  true // isDefault
);

// Start quick checkout
const session = await quickBuyService.createQuickCheckoutSession(
  "user_123",
  "prod_456",
  1,
  "pm_123",
  "addr_789"
);
// → { sessionId: 'qc_xxx', expiresAt: Date, ... }
```

---

## 13. BlogContentService

**File:** `src/lib/services/content/blog-content.service.ts`
**Import:** `import { blogContentService } from '@/lib/services';`

### Core Methods

| Method                                                                                                                              | Params                              | Returns          | Use Case        |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------- | --------------- |
| `createBlogPost(title, content, excerpt, author, categoryId, tags, image, seoTitle, seoDescription, seoKeywords, featured, status)` | complex                             | `BlogPost`       | New article     |
| `updateBlogPost(postId, updates)`                                                                                                   | `string, object`                    | `BlogPost`       | Edit article    |
| `getPublishedPosts(page, limit, category?, featured?)`                                                                              | `number, number, string?, boolean?` | `PaginatedPosts` | Listing page    |
| `getBlogPostBySlug(slug)`                                                                                                           | `string`                            | `BlogPost`       | View article    |
| `getRelatedPosts(postId, limit?)`                                                                                                   | `string, number?`                   | `BlogPost[]`     | Related section |
| `searchBlogPosts(query, limit?)`                                                                                                    | `string, number?`                   | `BlogPost[]`     | Search results  |
| `getFeaturedPosts(limit?)`                                                                                                          | `number?`                           | `BlogPost[]`     | Homepage        |
| `deleteBlogPost(postId)`                                                                                                            | `string`                            | `boolean`        | Remove article  |
| `createBlogCategory(name, slug, description?, image?)`                                                                              | complex                             | `BlogCategory`   | Category        |
| `getBlogCategories()`                                                                                                               | none                                | `BlogCategory[]` | Category list   |
| `getBlogCategoryBySlug(slug)`                                                                                                       | `string`                            | `BlogCategory`   | Category page   |
| `generateBlogSitemap()`                                                                                                             | none                                | `string`         | XML sitemap     |

### Statuses

`draft` | `published` | `archived`

### Example Usage

```typescript
// Create blog post
const post = await blogContentService.createBlogPost(
  "How to Choose the Right Size",
  "<h2>Introduction...</h2><p>Guide content...</p>",
  "Learn how to find your perfect fit",
  "John Doe",
  "cat_guides",
  ["sizing", "fit", "guide"],
  "/images/sizing-guide.jpg",
  "Size Guide",
  "Learn how to choose the right size",
  ["sizing", "fit"],
  true, // featured
  "published"
);

// Get published posts with pagination
const result = await blogContentService.getPublishedPosts(1, 10, "guides");
// → { posts: [...], total: 45, page: 1, limit: 10 }

// Get single post by slug
const post = await blogContentService.getBlogPostBySlug("how-to-choose-size");
// Auto-increments viewCount

// Get featured posts for homepage
const featured = await blogContentService.getFeaturedPosts(5);

// Search blog
const results = await blogContentService.searchBlogPosts("sizing");

// Generate sitemap for search engines
const sitemap = await blogContentService.generateBlogSitemap();
// → <urlset><url><loc>...</loc></url>...</urlset>
```

---

## Common Patterns

### Error Handling

```typescript
try {
  const result = await service.method();
} catch (error) {
  console.error("Service error:", error);
  // Handle error
}
```

### Event Subscription

```typescript
service.on("event-name", (data) => {
  console.log("Event fired:", data);
});
```

### Pagination

```typescript
const results = await service.method({
  page: 1,
  limit: 20,
  sortBy: "createdAt",
});
```

### Filtering

```typescript
const results = await service.method({
  filters: [
    { field: "status", values: ["active"] },
    { field: "price", values: { min: 10, max: 100 } },
  ],
});
```

---

## Quick Implementation Checklist

```
Database:
[ ] Add schema models
[ ] Run migrations
[ ] Verify indexes

API Routes:
[ ] Create route handlers
[ ] Add validation
[ ] Add authentication
[ ] Test endpoints

Frontend:
[ ] Create components
[ ] Connect to API routes
[ ] Handle loading states
[ ] Handle errors

Testing:
[ ] Unit tests
[ ] Integration tests
[ ] E2E tests

Performance:
[ ] Cache frequently used data
[ ] Add pagination
[ ] Optimize queries
[ ] Monitor performance

Deployment:
[ ] Test in staging
[ ] Deploy to production
[ ] Monitor errors
[ ] Monitor performance
```
