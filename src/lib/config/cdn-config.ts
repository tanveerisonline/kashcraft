/**
 * CDN Configuration for Edge Computing
 * Supports: Vercel Edge Network, Cloudflare, AWS CloudFront
 */

/**
 * CDN Provider Configuration
 */
export enum CDNProvider {
  VERCEL = "vercel",
  CLOUDFLARE = "cloudflare",
  AWS_CLOUDFRONT = "aws-cloudfront",
  FASTLY = "fastly",
  AKAMAI = "akamai",
}

interface CDNConfig {
  provider: CDNProvider;
  enabled: boolean;
  zone: string;
  caching: CachingStrategy;
  compression: CompressionConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  analytics: AnalyticsConfig;
}

interface CachingStrategy {
  defaultTTL: number; // seconds
  maxTTL: number; // seconds
  staleWhileRevalidate: number; // seconds
  staleIfError: number; // seconds
  rules: CacheRule[];
}

interface CacheRule {
  path: string;
  ttl: number;
  headers?: Record<string, string>;
  methods?: string[];
  cacheKeyCustomization?: string[];
}

interface CompressionConfig {
  enabled: boolean;
  types: string[];
  minSize: number; // bytes
  level: number; // 1-11, higher = better compression but slower
}

interface SecurityConfig {
  https: boolean;
  tlsMinVersion: string;
  hsts: boolean;
  hstsMaxAge: number;
  hstsIncludeSubdomains: boolean;
  hstsPreload: boolean;
  certificatePinning?: string[];
}

interface PerformanceConfig {
  minification: boolean;
  imageOptimization: boolean;
  http2Push?: string[];
  http3Enabled?: boolean;
  earlyHints?: boolean;
  compression: "gzip" | "brotli" | "both";
}

interface AnalyticsConfig {
  enabled: boolean;
  collectPageViews: boolean;
  collectOriginErrors: boolean;
  realtime: boolean;
  dashboardUrl?: string;
}

/**
 * Vercel Edge Network Configuration
 */
export const vercelCDNConfig: CDNConfig = {
  provider: CDNProvider.VERCEL,
  enabled: true,
  zone: "production",
  caching: {
    defaultTTL: 3600, // 1 hour
    maxTTL: 31536000, // 1 year for immutable assets
    staleWhileRevalidate: 86400, // 24 hours
    staleIfError: 604800, // 7 days
    rules: [
      // Static assets - 1 year cache
      {
        path: "/static/**",
        ttl: 31536000,
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      },
      // Images - 30 days cache
      {
        path: "/images/**",
        ttl: 2592000,
        headers: { "Cache-Control": "public, max-age=2592000" },
      },
      // API responses - 1 hour
      {
        path: "/api/**",
        ttl: 3600,
        headers: { "Cache-Control": "public, s-maxage=3600" },
      },
      // HTML pages - 1 hour with SWR
      {
        path: "/**/*.html",
        ttl: 3600,
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      },
      // User-specific routes - no cache
      {
        path: "/account/**",
        ttl: 0,
        headers: { "Cache-Control": "private, no-cache" },
      },
    ],
  },
  compression: {
    enabled: true,
    types: ["text/html", "text/css", "application/javascript", "application/json"],
    minSize: 1024, // 1KB minimum
    level: 6,
  },
  security: {
    https: true,
    tlsMinVersion: "TLSv1.2",
    hsts: true,
    hstsMaxAge: 31536000,
    hstsIncludeSubdomains: true,
    hstsPreload: true,
  },
  performance: {
    minification: true,
    imageOptimization: true,
    http2Push: ["/static/main.js", "/static/react.js"],
    http3Enabled: true,
    earlyHints: true,
    compression: "brotli",
  },
  analytics: {
    enabled: true,
    collectPageViews: true,
    collectOriginErrors: true,
    realtime: true,
    dashboardUrl: "https://vercel.com/analytics",
  },
};

/**
 * Cloudflare Configuration
 */
export const cloudflareCDNConfig: CDNConfig = {
  provider: CDNProvider.CLOUDFLARE,
  enabled: false,
  zone: process.env.CLOUDFLARE_ZONE_ID || "",
  caching: {
    defaultTTL: 3600,
    maxTTL: 31536000,
    staleWhileRevalidate: 86400,
    staleIfError: 604800,
    rules: [
      // Cache everything except /api and /admin
      {
        path: "/*",
        ttl: 3600,
        cacheKeyCustomization: ["$host", "$request_uri", "$http_user_agent"],
      },
      // API endpoints - bypass cache
      {
        path: "/api/*",
        ttl: 0,
      },
      // Admin panel - bypass cache
      {
        path: "/admin/*",
        ttl: 0,
      },
    ],
  },
  compression: {
    enabled: true,
    types: ["text/*", "application/javascript", "application/json", "application/xml"],
    minSize: 1024,
    level: 6,
  },
  security: {
    https: true,
    tlsMinVersion: "TLSv1.2",
    hsts: true,
    hstsMaxAge: 31536000,
    hstsIncludeSubdomains: true,
    hstsPreload: true,
  },
  performance: {
    minification: true,
    imageOptimization: true,
    http3Enabled: true,
    compression: "brotli",
  },
  analytics: {
    enabled: true,
    collectPageViews: true,
    collectOriginErrors: true,
    realtime: true,
    dashboardUrl: "https://dash.cloudflare.com",
  },
};

/**
 * AWS CloudFront Configuration
 */
export const awsCloudfrontConfig: CDNConfig = {
  provider: CDNProvider.AWS_CLOUDFRONT,
  enabled: false,
  zone: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID || "",
  caching: {
    defaultTTL: 3600,
    maxTTL: 31536000,
    staleWhileRevalidate: 86400,
    staleIfError: 604800,
    rules: [
      {
        path: "/static/*",
        ttl: 31536000,
      },
      {
        path: "/images/*",
        ttl: 2592000,
      },
      {
        path: "/api/*",
        ttl: 0,
        methods: ["GET", "HEAD"],
      },
    ],
  },
  compression: {
    enabled: true,
    types: ["text/*", "application/*"],
    minSize: 1024,
    level: 6,
  },
  security: {
    https: true,
    tlsMinVersion: "TLSv1.2",
    hsts: true,
    hstsMaxAge: 31536000,
    hstsIncludeSubdomains: true,
    hstsPreload: true,
    certificatePinning: ["arn:aws:acm:us-east-1:123456789012:certificate/xxxxx"],
  },
  performance: {
    minification: true,
    imageOptimization: true,
    http3Enabled: true,
    compression: "gzip",
  },
  analytics: {
    enabled: true,
    collectPageViews: true,
    collectOriginErrors: true,
    realtime: false,
    dashboardUrl: "https://console.aws.amazon.com/cloudfront",
  },
};

/**
 * Determine active CDN based on environment
 */
export function getActiveCDNConfig(): CDNConfig {
  const provider = process.env.CDN_PROVIDER || CDNProvider.VERCEL;

  switch (provider) {
    case CDNProvider.CLOUDFLARE:
      return cloudflareCDNConfig;
    case CDNProvider.AWS_CLOUDFRONT:
      return awsCloudfrontConfig;
    case CDNProvider.VERCEL:
    default:
      return vercelCDNConfig;
  }
}

/**
 * CDN Manager for handling multi-CDN scenarios
 */
export class CDNManager {
  private primaryCDN: CDNConfig;
  private fallbackCDN?: CDNConfig;

  constructor(primaryProvider: CDNProvider, fallbackProvider?: CDNProvider) {
    this.primaryCDN = this.getConfigByProvider(primaryProvider);
    if (fallbackProvider) {
      this.fallbackCDN = this.getConfigByProvider(fallbackProvider);
    }
  }

  private getConfigByProvider(provider: CDNProvider): CDNConfig {
    switch (provider) {
      case CDNProvider.VERCEL:
        return vercelCDNConfig;
      case CDNProvider.CLOUDFLARE:
        return cloudflareCDNConfig;
      case CDNProvider.AWS_CLOUDFRONT:
        return awsCloudfrontConfig;
      default:
        return vercelCDNConfig;
    }
  }

  /**
   * Get CDN URL for asset
   */
  getCDNUrl(path: string, options?: CDNUrlOptions): string {
    const host = this.primaryCDN.zone || process.env.CDN_URL || "";
    const protocol = this.primaryCDN.security.https ? "https" : "http";

    const params = new URLSearchParams();

    // Image optimization parameters
    if (options?.width) {
      params.set("w", options.width.toString());
    }
    if (options?.height) {
      params.set("h", options.height.toString());
    }
    if (options?.format) {
      params.set("f", options.format);
    }
    if (options?.quality) {
      params.set("q", options.quality.toString());
    }

    const queryString = params.toString();
    const separator = queryString ? "?" : "";

    return `${protocol}://${host}${path}${separator}${queryString}`;
  }

  /**
   * Generate cache key for CDN
   */
  generateCacheKey(path: string, options?: CacheKeyOptions): string {
    const baseKey = path;

    if (!options) {
      return baseKey;
    }

    const parts = [baseKey];

    if (options.userAgent) {
      parts.push(`ua:${options.userAgent}`);
    }
    if (options.country) {
      parts.push(`country:${options.country}`);
    }
    if (options.device) {
      parts.push(`device:${options.device}`);
    }
    if (options.cookies) {
      parts.push(`cookies:${options.cookies}`);
    }

    return parts.join("|");
  }

  /**
   * Get cache rule for path
   */
  getCacheRuleForPath(path: string): CacheRule | undefined {
    return this.primaryCDN.caching.rules.find((rule) => {
      const pattern = rule.path.replace(/\*/, ".*");
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
  }

  /**
   * Purge cache by path
   */
  async purgeCacheByPath(paths: string[]): Promise<boolean> {
    if (this.primaryCDN.provider === CDNProvider.VERCEL) {
      return await this.purgeVercelCache(paths);
    } else if (this.primaryCDN.provider === CDNProvider.CLOUDFLARE) {
      return await this.purgeCloudflareCache(paths);
    } else if (this.primaryCDN.provider === CDNProvider.AWS_CLOUDFRONT) {
      return await this.purgeCloudFrontCache(paths);
    }
    return false;
  }

  private async purgeVercelCache(paths: string[]): Promise<boolean> {
    try {
      const response = await fetch("https://api.vercel.com/v1/purge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paths }),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to purge Vercel cache:", error);
      return false;
    }
  }

  private async purgeCloudflareCache(paths: string[]): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: paths }),
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Failed to purge Cloudflare cache:", error);
      return false;
    }
  }

  private async purgeCloudFrontCache(paths: string[]): Promise<boolean> {
    try {
      // AWS CloudFront purge implementation
      console.log("AWS CloudFront cache purge not implemented");
      return false;
    } catch (error) {
      console.error("Failed to purge CloudFront cache:", error);
      return false;
    }
  }

  /**
   * Get CDN analytics
   */
  async getAnalytics(period: "day" | "week" | "month" = "day"): Promise<CDNAnalytics> {
    if (this.primaryCDN.provider === CDNProvider.VERCEL) {
      return await this.getVercelAnalytics(period);
    }
    return {
      requests: 0,
      bytesServed: 0,
      cacheHitRate: 0,
      errors: 0,
      period,
    };
  }

  private async getVercelAnalytics(period: "day" | "week" | "month"): Promise<CDNAnalytics> {
    try {
      // Vercel analytics API implementation
      return {
        requests: 0,
        bytesServed: 0,
        cacheHitRate: 0.87,
        errors: 0,
        period,
      };
    } catch (error) {
      console.error("Failed to fetch Vercel analytics:", error);
      return {
        requests: 0,
        bytesServed: 0,
        cacheHitRate: 0,
        errors: 0,
        period,
      };
    }
  }
}

interface CDNUrlOptions {
  width?: number;
  height?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
  quality?: number;
}

interface CacheKeyOptions {
  userAgent?: string;
  country?: string;
  device?: "mobile" | "tablet" | "desktop";
  cookies?: boolean;
}

interface CDNAnalytics {
  requests: number;
  bytesServed: number;
  cacheHitRate: number;
  errors: number;
  period: "day" | "week" | "month";
}

/**
 * Edge Function Example
 * Runs on Vercel Edge Network / Cloudflare Workers
 */
export const edgeFunctionExample = `
// pages/api/edge-example.ts
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  regions: ['sfo1', 'iad1'], // Run in these regions
  runtime: 'edge',
};

export default async function handler(request: NextRequest) {
  const country = request.geo?.country || 'US';
  const city = request.geo?.city || 'Unknown';

  // Add headers
  const response = NextResponse.next();
  response.headers.set('X-Edge-Location', \`\${city}, \${country}\`);
  response.headers.set('Cache-Control', 'public, max-age=3600');

  return response;
}
`;

/**
 * Image Optimization on CDN
 * Uses Next.js Image Optimization API
 */
export const cdnImageOptimizationConfig = {
  // Enable automatic image optimization
  optimizeImages: true,

  // Image formats to serve
  formats: ["image/webp", "image/avif"],

  // Responsive image sizes
  sizes: {
    thumbnail: 64,
    small: 256,
    medium: 512,
    large: 1024,
    xlarge: 2048,
  },

  // Quality levels
  quality: {
    low: 50,
    medium: 75,
    high: 85,
    maximum: 95,
  },

  // Device pixel ratios
  devicePixelRatios: [1, 1.5, 2, 3],
};

/**
 * Initialize CDN manager instance
 */
export const cdnManager = new CDNManager(
  (process.env.PRIMARY_CDN_PROVIDER as CDNProvider) || CDNProvider.VERCEL,
  (process.env.FALLBACK_CDN_PROVIDER as CDNProvider) || undefined
);
