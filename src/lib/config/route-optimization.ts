/**
 * Route Optimization Configuration
 * Implements: Parallel routes, streaming, Suspense boundaries, Server Components
 */

import { Suspense, ReactNode } from "react";
import { notFound } from "next/navigation";

/**
 * Parallel Routes Configuration
 * Used for: Modals, sidebars, team pages that render sibling routes
 */
export const parallelRoutesConfig = {
  /**
   * Product details with parallel analytics sidebar
   * URL: /products/[id]?modal=reviews
   */
  productDetails: {
    layout: "src/app/products/[id]/layout.tsx",
    components: {
      main: "ProductDetailContent",
      sidebar: "ProductAnalytics",
      modal: "ProductReviewsModal",
    },
    suspenseBoundaries: {
      main: {
        fallback: "<ProductDetailSkeleton />",
        timeout: 5000,
      },
      sidebar: {
        fallback: "<AnalyticsSkeleton />",
        timeout: 3000,
      },
      modal: {
        fallback: "<ModalSkeleton />",
        timeout: 2000,
      },
    },
  },

  /**
   * Order management with parallel team sidebar
   * URL: /admin/orders?team=engineering
   */
  adminDashboard: {
    layout: "src/app/admin/layout.tsx",
    components: {
      main: "OrdersContent",
      sidebar: "TeamSidebar",
      metrics: "MetricsPanel",
    },
    suspenseBoundaries: {
      main: { fallback: "<OrdersSkeleton />", timeout: 5000 },
      sidebar: { fallback: "<TeamSkeleton />", timeout: 3000 },
      metrics: { fallback: "<MetricsSkeleton />", timeout: 4000 },
    },
  },

  /**
   * Checkout with parallel shipping and payment forms
   * URL: /checkout?step=payment
   */
  checkout: {
    layout: "src/app/checkout/layout.tsx",
    components: {
      main: "CheckoutForm",
      shipping: "ShippingForm",
      payment: "PaymentForm",
      summary: "OrderSummary",
    },
    suspenseBoundaries: {
      main: { fallback: "<CheckoutSkeleton />", timeout: 4000 },
      shipping: { fallback: "<ShippingSkeleton />", timeout: 3000 },
      payment: { fallback: "<PaymentSkeleton />", timeout: 3000 },
      summary: { fallback: "<SummarySkeleton />", timeout: 2000 },
    },
  },
};

/**
 * Streaming Boundaries Configuration
 * Progressive rendering with React Suspense
 */
export const streamingBoundariesConfig = {
  /**
   * Critical content rendered immediately
   * Non-critical content streamed as available
   */
  productListing: {
    critical: ["ProductFilters", "ProductSort", "PaginationControls"],
    streamed: ["ProductGrid", "Reviews", "Recommendations", "Analytics"],
    order: ["filters", "grid", "recommendations", "reviews"],
  },

  /**
   * Checkout flow with progressive rendering
   */
  checkoutFlow: {
    critical: ["AddressForm", "PaymentForm", "CartSummary"],
    streamed: ["ShippingMethods", "PromoCode", "OrderHistory", "Recommendations"],
    order: ["address", "shipping", "payment", "promo", "history"],
  },

  /**
   * User account page with parallel content
   */
  userAccount: {
    critical: ["UserProfile", "NavigationMenu"],
    streamed: ["Orders", "Addresses", "Wishlist", "Preferences", "Notifications"],
    order: ["profile", "orders", "addresses", "wishlist", "preferences"],
  },
};

/**
 * Route Prefetching Strategy
 */
export const routePrefetchConfig = {
  /**
   * Aggressive prefetch for high-traffic routes
   */
  aggressive: ["/", "/products", "/cart", "/checkout", "/account/orders"],

  /**
   * Moderate prefetch for medium-traffic routes
   */
  moderate: ["/account", "/account/wishlist", "/account/preferences", "/search", "/categories"],

  /**
   * Lazy prefetch for low-traffic routes
   */
  lazy: ["/admin", "/admin/products", "/admin/orders", "/api-docs"],
};

/**
 * Dynamic Imports Configuration
 * Code splitting for route components
 */
export const dynamicImportsConfig = {
  /**
   * Admin routes - heavy components, lazy load
   */
  admin: {
    dashboard:
      'dynamic(() => import("@/components/admin/dashboard"), { loading: () => <DashboardSkeleton /> })',
    products:
      'dynamic(() => import("@/components/admin/products"), { loading: () => <ProductsSkeleton /> })',
    orders:
      'dynamic(() => import("@/components/admin/orders"), { loading: () => <OrdersSkeleton /> })',
    users:
      'dynamic(() => import("@/components/admin/users"), { loading: () => <UsersSkeleton /> })',
  },

  /**
   * Feature routes - medium components, normal load
   */
  features: {
    checkout: 'dynamic(() => import("@/components/features/checkout/checkout-flow"))',
    cart: 'dynamic(() => import("@/components/features/cart/cart-page"))',
    search: 'dynamic(() => import("@/components/features/search/search-results"))',
  },

  /**
   * Modal components - small, interactive
   */
  modals: {
    productReviews: 'dynamic(() => import("@/components/modals/product-reviews"))',
    confirmDelete: 'dynamic(() => import("@/components/modals/confirm-delete"))',
    imageZoom: 'dynamic(() => import("@/components/modals/image-zoom"))',
  },
};

/**
 * Server Component Strategy
 * Routes that benefit from server-side rendering
 */
export const serverComponentStrategy = {
  /**
   * Full Server Components (no hydration)
   */
  fullServer: [
    "/products", // Product listing from database
    "/categories", // Category navigation
    "/admin", // Admin panel
    "/api", // API routes
  ],

  /**
   * Server Components with Client Islands
   * Small interactive regions on server-rendered page
   */
  hybrid: [
    "/products/[id]", // Product detail with reviews form
    "/checkout", // Checkout with interactive form
    "/account", // Account with settings forms
  ],

  /**
   * Client Components with Server Data Loading
   * Client-rendered with server-side data fetching
   */
  clientWithServerData: [
    "/search", // Client-side search with server results
    "/cart", // Client-side cart UI with server cart data
  ],
};

/**
 * Caching Strategy by Route
 */
export const routeCachingStrategy = {
  // Static routes - ISR with 1 day revalidation
  static: {
    routes: ["/", "/about", "/privacy", "/terms"],
    revalidate: 86400, // 24 hours
    staleWhileRevalidate: 604800, // 7 days
  },

  // Dynamic routes - ISR with 1 hour revalidation
  dynamic: {
    routes: ["/products", "/categories", "/search"],
    revalidate: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
  },

  // User-specific routes - no caching
  userSpecific: {
    routes: ["/account", "/orders", "/wishlist"],
    revalidate: false,
  },

  // API routes - configurable per endpoint
  api: {
    products: { revalidate: 3600, tag: "products" },
    categories: { revalidate: 3600, tag: "categories" },
    orders: { revalidate: 0, tag: "orders" }, // No cache
    user: { revalidate: 300, tag: "user" }, // 5 minutes
  },
};

/**
 * Loading States and Skeletons
 */
export const loadingStatesConfig = {
  /**
   * Page-level loading state
   */
  page: {
    skeleton: "ProductListSkeleton",
    duration: 500, // Show spinner after 500ms
    minimumDuration: 200, // Show skeleton for min 200ms
  },

  /**
   * Component-level loading states
   */
  component: {
    ProductCard: { skeleton: "CardSkeleton", duration: 300 },
    ProductImage: { skeleton: "ImageSkeleton", duration: 200 },
    ProductReviews: { skeleton: "ReviewsSkeleton", duration: 400 },
    OrderHistory: { skeleton: "OrdersSkeleton", duration: 500 },
    UserProfile: { skeleton: "ProfileSkeleton", duration: 400 },
  },

  /**
   * Error states
   */
  error: {
    boundary: "ErrorBoundary",
    fallback: "ErrorPage",
    retry: true,
    retryDelay: 1000,
  },
};

/**
 * Route Segments and Layout Configuration
 */
export const routeSegmentsConfig = {
  /**
   * Public routes - cached
   */
  public: {
    layout: "PublicLayout",
    navbar: true,
    footer: true,
    sidebar: false,
    cache: "public",
  },

  /**
   * Product routes - cached with ISR
   */
  products: {
    layout: "ProductLayout",
    navbar: true,
    footer: true,
    sidebar: "ProductFilters",
    cache: "public",
    revalidate: 3600,
  },

  /**
   * Checkout routes - private, no cache
   */
  checkout: {
    layout: "CheckoutLayout",
    navbar: false,
    footer: false,
    sidebar: "OrderSummary",
    cache: "private",
    revalidate: false,
  },

  /**
   * Account routes - private, user-specific
   */
  account: {
    layout: "DashboardLayout",
    navbar: true,
    footer: false,
    sidebar: "AccountMenu",
    cache: "private",
    revalidate: false,
  },

  /**
   * Admin routes - private, protected
   */
  admin: {
    layout: "AdminLayout",
    navbar: true,
    footer: false,
    sidebar: "AdminMenu",
    cache: "private",
    revalidate: false,
    auth: "admin",
  },
};

/**
 * Optimization Utilities
 */
export class RouteOptimizer {
  /**
   * Get optimal prefetch strategy for route
   */
  static getPrefetchStrategy(route: string): "aggressive" | "moderate" | "lazy" {
    if (routePrefetchConfig.aggressive.includes(route)) {
      return "aggressive";
    }
    if (routePrefetchConfig.moderate.includes(route)) {
      return "moderate";
    }
    return "lazy";
  }

  /**
   * Get caching headers for route
   */
  static getCacheHeaders(route: string): Record<string, string> {
    const caching = routeCachingStrategy;

    if (caching.static.routes.includes(route)) {
      return {
        "Cache-Control": `public, s-maxage=${caching.static.revalidate}, stale-while-revalidate=${caching.static.staleWhileRevalidate}`,
      };
    }

    if (caching.dynamic.routes.includes(route)) {
      return {
        "Cache-Control": `public, s-maxage=${caching.dynamic.revalidate}, stale-while-revalidate=${caching.dynamic.staleWhileRevalidate}`,
      };
    }

    return {
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    };
  }

  /**
   * Check if route should stream
   */
  static shouldStream(route: string): boolean {
    const streamingRoutes = Object.values(streamingBoundariesConfig)
      .map((config) => config.critical || [])
      .flat();
    return streamingRoutes.length > 0;
  }

  /**
   * Get streaming boundaries for route
   */
  static getStreamingBoundaries(route: string) {
    if (route.includes("products")) {
      return streamingBoundariesConfig.productListing;
    }
    if (route.includes("checkout")) {
      return streamingBoundariesConfig.checkoutFlow;
    }
    if (route.includes("account")) {
      return streamingBoundariesConfig.userAccount;
    }
    return null;
  }
}

/**
 * Next.js Configuration Exports
 */
export const nextConfigRouteOptimizations = {
  /**
   * Static generation with ISR
   */
  async generateStaticParams() {
    return [];
  },

  /**
   * Route caching
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  /**
   * Redirects
   */
  async redirects() {
    return [
      {
        source: "/old-product/:id",
        destination: "/products/:id",
        permanent: true,
      },
    ];
  },

  /**
   * Rewrites for API routes
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "/api/:path*",
        },
      ],
      afterFiles: [
        {
          source: "/:path*",
          destination: "/404",
        },
      ],
    };
  },
};
