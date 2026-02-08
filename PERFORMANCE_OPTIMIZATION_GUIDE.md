# Performance Optimization Guide

## Overview

This guide provides comprehensive documentation on the performance optimization infrastructure implemented for the Kashcraft e-commerce platform. The system is designed to achieve optimal Lighthouse scores (90+), Core Web Vitals thresholds, and API response times while maintaining excellent user experience.

## Architecture

The performance optimization system is built on five core pillars:

### 1. Image Optimization (`src/lib/utils/image-optimization.ts`)

Implements Next.js Image component with advanced features:

**Features:**

- Automatic format conversion (WebP/AVIF fallback)
- Lazy loading with blur placeholders
- Responsive image sizing
- Priority loading for above-fold images
- Smooth fade-in animations
- Custom lazy loading with IntersectionObserver

**Components:**

```typescript
// ProductImage - optimized for product listings
<ProductImage
  src={productUrl}
  alt="Product"
  priority={isAboveFold}
/>

// HeroImage - optimized for hero sections
<HeroImage src={heroUrl} alt="Hero" />

// ThumbnailImage - small preview images
<ThumbnailImage src={thumbUrl} alt="Thumbnail" />

// AvatarImage - user profile images
<AvatarImage src={userUrl} alt="Avatar" />

// BackgroundImage - CSS background images
<BackgroundImage src={bgUrl} alt="Background" />

// OptimizedImage - customizable
<OptimizedImage
  src={src}
  alt={alt}
  sizes="responsive"
  priority={priority}
/>
```

**Best Practices:**

1. **Always use `priority` for above-fold images:**

   ```typescript
   <ProductImage src={image} priority={index < 4} />
   ```

2. **Specify correct sizes for responsive images:**

   ```typescript
   <ProductImage
     src={image}
     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
   />
   ```

3. **Use blur placeholders for perceived performance:**
   ```typescript
   <ProductImage
     src={image}
     blurDataURL={blurPlaceholder}
     placeholder="blur"
   />
   ```

### 2. Caching Strategy (`src/lib/cache/cache.service.ts`)

Implements dual Redis + in-memory caching with cache-aside pattern.

**Architecture:**

```
┌─────────────────┐
│   Cache Miss    │
└────────┬────────┘
         │
    ┌────▼────┐
    │  Redis  │ ◄──── Try first (distributed cache)
    └────┬────┘
         │ (miss)
    ┌────▼─────────────┐
    │  In-Memory Cache │ ◄──── Fallback
    └────┬─────────────┘
         │ (miss)
    ┌────▼──────┐
    │  Database │ ◄──── Origin
    └───────────┘
```

**Services:**

1. **ProductCacheService:**

   ```typescript
   // Cache product by ID (TTL: 1 hour)
   await productCache.setProduct(product);
   const cached = await productCache.getProduct(productId);

   // Cache products by category
   await productCache.setCategoryProducts(categoryId, products);

   // Invalidate on update
   await productCache.invalidateProduct(productId);
   ```

2. **CategoryCacheService:**

   ```typescript
   // Cache entire category tree
   await categoryCache.setCategories(categories);
   const cached = await categoryCache.getCategories();
   ```

3. **SessionCacheService:**

   ```typescript
   // Cache user session data
   await sessionCache.setSession(userId, sessionData);

   // Cache user cart
   await sessionCache.setCart(userId, cartItems);

   // Cache wishlist
   await sessionCache.setWishlist(userId, wishlistItems);
   ```

**Configuration:**

```typescript
// Default TTL (Time To Live)
const TTL = 3600; // 1 hour

// Cache keys follow pattern: namespace:type:id
// Example: cache:product:123

// Supports stale-while-revalidate
const cached = await cache.getOrSet("product:123", async () => await fetchProduct("123"), {
  ttl: 3600,
  staleWhileRevalidate: 1800, // 30 min
});
```

**Best Practices:**

1. **Invalidate caches on updates:**

   ```typescript
   // After updating a product
   await productCache.invalidateProduct(productId);
   ```

2. **Use cache-aside pattern:**

   ```typescript
   const data = await cache.getOrSet("key", async () => await fetchData(), { ttl: 3600 });
   ```

3. **Monitor cache hit rate:**
   ```typescript
   const stats = cache.getStats();
   console.log(`Hit rate: ${stats.hitRate}%`);
   ```

### 3. Database Query Optimization (`src/lib/db/query-optimizer.ts`)

Prevents N+1 queries and optimizes database performance.

**Features:**

1. **Query Performance Monitoring:**

   ```typescript
   const monitor = new QueryPerformanceMonitor();
   console.log(monitor.getSummary());
   // {
   //   queryCount: 42,
   //   totalTime: 2500,
   //   avgTime: 59.5
   // }
   ```

2. **Batch Query Execution (N+1 Prevention):**

   ```typescript
   const executor = new BatchQueryExecutor();

   // Execute 100 queries in batches of 10
   const results = await executor.executeBatch(queries, { batchSize: 10 });
   ```

3. **Recommended Indexes:**

   ```typescript
   const indexes = QueryOptimizer.getRecommendedIndexes();
   // Returns 20+ indexes for products, categories, orders, etc.
   ```

4. **Optimal Field Selection:**

   ```typescript
   const products = await prisma.product.findMany({
     where: filters,
     select: QueryOptimizer.getOptimalSelects().product,
     // Only selects necessary fields, reducing data transfer
   });
   ```

5. **Pagination Helper:**

   ```typescript
   const { skip, take } = PaginationHelper.getPaginationParams((page = 1), (pageSize = 20));

   const products = await prisma.product.findMany({
     skip,
     take,
   });
   ```

**Best Practices:**

1. **Always use pagination:**

   ```typescript
   const { skip, take } = PaginationHelper.getPaginationParams(page, 20);
   const products = await prisma.product.findMany({ skip, take });
   ```

2. **Limit field selection:**

   ```typescript
   const products = await prisma.product.findMany({
     select: {
       id: true,
       name: true,
       price: true,
       // Only select necessary fields
     },
   });
   ```

3. **Batch load related data:**

   ```typescript
   const products = await batchLoadRelations("product", productIds, ["reviews", "ratings"]);
   ```

4. **Monitor query performance:**
   ```typescript
   await recordQueryTiming("findProducts", async () => {
     return await prisma.product.findMany(query);
   });
   ```

### 4. Rate Limiting (`src/lib/middleware/rate-limiter.ts`)

Protects API endpoints from abuse and ensures fair resource usage.

**Preset Configurations:**

```typescript
// 6 preset configurations available

1. strict:   10 requests per minute
2. standard: 100 requests per minute
3. loose:    500 requests per minute
4. api:      1000 requests per 15 minutes
5. auth:     5 requests per 15 minutes
6. search:   30 requests per minute
```

**Usage:**

```typescript
import { rateLimiters } from "@/lib/middleware/rate-limiter";

// Apply to API route
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const result = await rateLimiters.api.isAllowed(ip);

  if (!result.allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": calculateRetryAfter(result.resetTime),
        "X-RateLimit-Limit": result.limit,
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.resetTime,
      },
    });
  }

  // Handle request
}
```

**Middleware Integration:**

```typescript
import { rateLimitMiddleware } from "@/lib/middleware/rate-limiter";

// Apply to all routes
export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  return await rateLimitMiddleware(request, {
    api: rateLimiters.api,
    auth: rateLimiters.auth,
  });
}
```

**Best Practices:**

1. **Use appropriate preset for endpoint:**

   ```typescript
   // Strict for auth
   const authResult = await rateLimiters.auth.isAllowed(userId);

   // Standard for general API
   const apiResult = await rateLimiters.standard.isAllowed(ip);
   ```

2. **Track rate limit headers:**

   ```typescript
   headers.set("X-RateLimit-Limit", result.limit.toString());
   headers.set("X-RateLimit-Remaining", result.remaining.toString());
   headers.set("X-RateLimit-Reset", result.resetTime.toString());
   ```

3. **Implement user-based limiting:**
   ```typescript
   const result = await rateLimiters.api.isAllowed(`user:${userId}`);
   ```

### 5. Monitoring & Metrics (`src/lib/monitoring/metrics.ts`)

Collects and reports performance metrics to Sentry and analytics.

**Components:**

1. **Sentry Integration:**

   ```typescript
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
     environment: process.env.NODE_ENV,
   });
   ```

2. **Performance Metrics:**

   ```typescript
   globalMetrics.recordPerformance({
     pathname: "/products",
     duration: 150,
     cacheStatus: "hit",
   });
   ```

3. **API Metrics:**

   ```typescript
   globalMetrics.recordApi({
     endpoint: "/api/products",
     method: "GET",
     statusCode: 200,
     duration: 50,
     responseSize: 12500,
     cacheStatus: "hit",
   });
   ```

4. **Web Vitals Collection:**

   ```typescript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

   getCLS((cb) => globalMetrics.recordWebVitals({ cls: cb.value }));
   getLCP((cb) => globalMetrics.recordWebVitals({ lcp: cb.value }));
   ```

5. **Query Timing:**
   ```typescript
   await recordQueryTiming("findProducts", async () => {
     return await prisma.product.findMany(query);
   });
   ```

**Metrics Summary:**

```typescript
const summary = globalMetrics.getSummary();
// {
//   avgPageLoadTime: 250,
//   slowestPage: '/checkout',
//   errorCount: 2,
//   cacheHitRate: 0.87,
//   apiP95ResponseTime: 450
// }
```

## Bundle Optimization (`next.config.ts`)

### Webpack Configuration

```typescript
webpack: (config) => {
  config.optimization.splitChunks = {
    chunks: 'all',
    cacheGroups: {
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        priority: 10,
      },
      ui: {
        test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
        name: 'ui',
      },
      database: {
        test: /[\\/](prisma|@prisma)[\\/]/,
        name: 'database',
      },
    },
  };
  return config;
},
```

### Image Optimization

```typescript
images: {
  domains: [
    'images.example.com',
    'cdn.example.com',
    'nextjs.org',
  ],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
},
```

### Caching Headers

```typescript
async headers() {
  return [
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=60' },
      ],
    },
    {
      source: '/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ];
},
```

## Lazy Loading (`src/lib/utils/lazy-loading.ts`)

### Component Code Splitting

```typescript
import { dynamicImport } from '@/lib/utils/lazy-loading';

// Lazy load components
const AdminDashboard = dynamicImport(() => import('@/components/admin/dashboard'));
const UserProfile = dynamicImport(() => import('@/components/user/profile'));

// In component
{showAdmin && <AdminDashboard />}
```

### Image Lazy Loading

```typescript
import { useLazyLoad } from '@/lib/utils/lazy-loading';

export function ProductGallery({ images }) {
  const ref = useRef(null);
  const isVisible = useLazyLoad(ref, () => {
    console.log('Image loaded!');
  });

  return (
    <div ref={ref}>
      {isVisible && <img src={images[0]} alt="Product" />}
    </div>
  );
}
```

### Script Deferred Loading

```typescript
import { ScriptLoader } from "@/lib/utils/lazy-loading";

// Load script after 3 seconds
ScriptLoader.loadScriptDeferred("https://cdn.example.com/analytics.js", 3000);

// Load script on interaction
ScriptLoader.loadScript("https://cdn.example.com/widget.js", { defer: true });
```

## Service Worker & PWA (`src/lib/services/pwa/service-worker.ts`)

### Features

1. **Offline Support:**
   - Cache-first strategy for static assets
   - Network-first for API calls
   - Fallback pages for offline access

2. **Background Sync:**

   ```typescript
   import { ServiceWorkerUtils } from "@/lib/services/pwa/service-worker";

   // Register background sync
   await ServiceWorkerUtils.registerBackgroundSync("sync-orders");
   ```

3. **Push Notifications:**

   ```typescript
   // Request permission
   const permission = await ServiceWorkerUtils.requestNotificationPermission();

   // Subscribe to push
   if (permission === "granted") {
     const subscription = await ServiceWorkerUtils.subscribeToPushNotifications(
       process.env.NEXT_PUBLIC_VAPID_KEY
     );
   }
   ```

4. **Online Status Tracking:**

   ```typescript
   import { useOnlineStatus } from '@/lib/services/pwa/service-worker';

   export function MyComponent() {
     const isOnline = useOnlineStatus();

     return <div>{isOnline ? 'Online' : 'Offline'}</div>;
   }
   ```

5. **Offline Queue:**

   ```typescript
   const queue = new OfflineQueue();

   // Add failed requests to queue
   queue.add({
     url: "/api/orders",
     method: "POST",
     body: JSON.stringify(orderData),
   });

   // Process when online
   window.addEventListener("online", () => {
     queue.processQueue();
   });
   ```

### Configuration

```typescript
// next-pwa automatically handles:
// - Static asset caching
// - Image caching with 30-day expiration
// - API call caching with 5-minute TTL
// - Font caching with 1-year expiration
// - HTML page caching with 1-day expiration
```

## Third-Party Script Optimization (`src/lib/services/third-party/script-optimizer.ts`)

### Script Manager

```typescript
import { ThirdPartyScriptManager } from "@/lib/services/third-party/script-optimizer";

const manager = new ThirdPartyScriptManager();

// Register scripts
manager.registerScript({
  id: "analytics",
  src: "https://cdn.example.com/analytics.js",
  strategy: "lazyOnload",
  waitForInteraction: true,
  minimumDelay: 3000,
});

// Load on demand
manager.loadScript("analytics");
```

### Optimized Scripts

```typescript
import {
  optimizedGoogleAnalytics,
  optimizedSegment,
  optimizedHotjar,
  optimizedIntercom,
} from "@/lib/services/third-party/script-optimizer";

// All configured with:
// - Deferred loading
// - User interaction triggering
// - Minimum delay before execution
// - Non-blocking async loading
```

### Best Practices

1. **Defer non-critical scripts:**

   ```typescript
   manager.registerScript({
     id: "tracking",
     src: "https://cdn.example.com/tracking.js",
     waitForInteraction: true,
     minimumDelay: 5000,
   });
   ```

2. **Preload critical resources:**

   ```typescript
   import { ScriptPreloader } from "@/lib/services/third-party/script-optimizer";

   ScriptPreloader.preloadCritical();
   ```

3. **Detect heavy scripts:**

   ```typescript
   import { HeavyScriptDetector } from "@/lib/services/third-party/script-optimizer";

   await HeavyScriptDetector.warnIfLarge(
     "https://cdn.example.com/heavy.js",
     50 * 1024 // 50KB threshold
   );
   ```

## Performance Budget (`src/lib/config/performance-budget.ts`)

### Targets

**Bundle Sizes:**

- Main JS: 150 KB
- React bundle: 150 KB
- UI components: 100 KB
- Database layer: 80 KB
- Total CSS: 50 KB
- Total JS: 500 KB

**Lighthouse Scores:**

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+
- PWA: 90+

**Core Web Vitals:**

- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 600ms
- INP (Interaction to Next Paint): < 200ms

**API Response Times:**

- P50: 100ms
- P75: 200ms
- P95: 500ms
- P99: 1000ms

### Validation

```typescript
import { PerformanceBudgetValidator, performanceBudget } from "@/lib/config/performance-budget";

// Check bundle size
const result = PerformanceBudgetValidator.checkBundleSize("main", actualSize);

if (result.status === "failure") {
  console.error(result.message);
  process.exit(1);
}

// Check Lighthouse scores
const lighthouse = PerformanceBudgetValidator.checkLighthouseScores({
  performance: 92,
  accessibility: 96,
});

// Check Web Vitals
const vitals = PerformanceBudgetValidator.checkWebVitals({
  lcp: 2200,
  cls: 0.08,
  ttfb: 500,
});
```

### CI/CD Integration

```typescript
import { performanceBudgetCI } from "@/lib/config/performance-budget";

// Generate GitHub Actions output
const output = performanceBudgetCI.generateGitHubActionsOutput(results);
console.log(output);

// Generate JSON report
const report = performanceBudgetCI.generateJsonReport(results);
console.log(report);
```

## Performance Checklist

### Before Deployment

- [ ] All bundle sizes within budget
- [ ] Lighthouse scores meet targets (90+)
- [ ] Web Vitals measured and validated
- [ ] API response times within P95 budget (500ms)
- [ ] Database queries optimized (no N+1)
- [ ] Caching strategy verified
- [ ] Images optimized and lazy-loaded
- [ ] Third-party scripts deferred
- [ ] Service Worker configured
- [ ] Performance budget enforced in CI/CD

### Monitoring

- [ ] Sentry configured and receiving events
- [ ] Web Vitals collected and monitored
- [ ] API metrics tracked
- [ ] Cache hit rate tracked (target: 80%+)
- [ ] Error rate monitored (target: < 0.1%)
- [ ] Database query time tracked
- [ ] Rate limiting active

### Regular Reviews

- [ ] Weekly performance reports
- [ ] Monthly Lighthouse audits
- [ ] Quarterly Web Vitals analysis
- [ ] Identify slow pages and optimize
- [ ] Review cache invalidation strategy
- [ ] Check database performance

## Troubleshooting

### High LCP (Largest Contentful Paint)

**Symptoms:** LCP > 2.5 seconds

**Solutions:**

1. Enable image optimization and lazy loading
2. Defer non-critical JavaScript
3. Reduce server response time (TTFB)
4. Use service worker for asset caching

### High CLS (Cumulative Layout Shift)

**Symptoms:** Layout shifting during page load

**Solutions:**

1. Reserve space for dynamic content
2. Avoid unsized images (always specify height/width)
3. Use `size-content-box` for fonts
4. Defer below-fold content loading

### Slow API Responses

**Symptoms:** API response time > 500ms

**Solutions:**

1. Add database indexes
2. Implement query optimization
3. Enable response caching
4. Implement pagination
5. Use batch queries to prevent N+1

### Bundle Size Too Large

**Symptoms:** Main bundle > 150 KB

**Solutions:**

1. Code splitting for route components
2. Tree-shaking unused imports
3. Compress assets with gzip
4. Defer non-critical dependencies
5. Use dynamic imports

## Resources

- [Web.dev Performance Guide](https://web.dev/performance/)
- [Next.js Performance Documentation](https://nextjs.org/learn/foundations/how-nextjs-works/rendering)
- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Webpack Documentation](https://webpack.js.org/concepts/optimization/)

## Contact & Support

For performance optimization questions or issues:

1. Check this guide first
2. Review performance metrics in Sentry
3. Run Lighthouse audit locally
4. Contact the DevOps team for infrastructure issues
