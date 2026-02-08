import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image Optimization (Prompt 126)
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.example.com",
      },
    ],
  },

  // Bundle Optimization (Prompt 129)
  productionBrowserSourceMaps: false,

  // Code Splitting & Dynamic Imports
  experimental: {
    optimizePackageImports: ["@/lib", "@/components", "lodash-es", "date-fns"],
    cacheComponents: true,
  },

  // Compression & Performance Headers
  compress: true,

  // Turbopack Configuration for Next.js 16
  // Using Turbopack instead of Webpack for Next.js 16
  turbopack: {},

  // Route Optimization (Prompt 130) - App Router specific
  // Partial Pre-Rendering for dynamic content with static shell
  // Note: cacheComponents moved to main experimental block above

  // Headers for Caching (Prompt 127, 132)
  async headers() {
    return [
      // API caching headers
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=120",
          },
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
      // Image optimization headers
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Static assets
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // HTML pages
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [];
  },

  // Rewrites
  async rewrites() {
    return [];
  },

  // Environment Variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Disable Static Optimization for Real-time Content
  staticPageGenerationTimeout: 60,
};

export default nextConfig;
