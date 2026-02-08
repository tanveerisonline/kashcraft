import { NextRequest, NextResponse } from "next/server";

// Prompt 134: Rate Limiting

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  statusCode?: number;
}

export interface RateLimitStore {
  get: (key: string) => Promise<{ count: number; resetTime: number } | null>;
  set: (key: string, data: { count: number; resetTime: number }) => Promise<void>;
}

/**
 * In-memory rate limit store
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  async get(key: string) {
    const data = this.store.get(key);
    if (!data) return null;

    // Clean up expired entries
    if (data.resetTime < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return data;
  }

  async set(key: string, data: { count: number; resetTime: number }) {
    this.store.set(key, data);
  }

  // Cleanup old entries periodically
  startCleanupInterval(intervalMs: number = 60000) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (data.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, intervalMs);
  }
}

/**
 * Sliding window rate limiter
 */
export class RateLimiter {
  constructor(
    private config: RateLimitConfig,
    private store: RateLimitStore = new InMemoryRateLimitStore()
  ) {}

  /**
   * Check if request is allowed
   */
  async isAllowed(
    key: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const data = await this.store.get(key);

    if (!data) {
      // First request
      const resetTime = now + this.config.windowMs;
      await this.store.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Check if window has expired
    if (data.resetTime < now) {
      const resetTime = now + this.config.windowMs;
      await this.store.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Within current window
    const remaining = this.config.maxRequests - data.count;
    const allowed = data.count < this.config.maxRequests;

    if (allowed) {
      await this.store.set(key, { count: data.count + 1, resetTime: data.resetTime });
    }

    return {
      allowed,
      remaining: Math.max(0, remaining - 1),
      resetTime: data.resetTime,
    };
  }

  /**
   * Get rate limit info for a key
   */
  async getInfo(key: string) {
    const data = await this.store.get(key);
    if (!data) {
      return {
        count: 0,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
      };
    }

    return {
      count: data.count,
      remaining: Math.max(0, this.config.maxRequests - data.count),
      resetTime: data.resetTime,
    };
  }

  /**
   * Reset rate limit for a key
   */
  async reset(key: string) {
    // Implementation depends on store
  }
}

/**
 * Rate limit middleware for API routes
 */
export const createRateLimitMiddleware = (config: RateLimitConfig) => {
  const limiter = new RateLimiter(config);

  return async (request: NextRequest) => {
    // Get client IP
    const clientIp =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Check rate limit
    const result = await limiter.isAllowed(clientIp);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: config.message || "Too many requests",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: config.statusCode || 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
          },
        }
      );
    }

    // Continue with response and add rate limit headers
    const response = request.next?.() || new NextResponse();
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

    return response;
  };
};

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict - 10 requests per minute
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: "Too many requests from this IP",
  } as RateLimitConfig,

  // Standard - 100 requests per minute
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: "Too many requests",
  } as RateLimitConfig,

  // Loose - 500 requests per minute
  loose: {
    windowMs: 60 * 1000,
    maxRequests: 500,
    message: "Rate limit exceeded",
  } as RateLimitConfig,

  // API - 1000 requests per 15 minutes
  api: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 1000,
    message: "API rate limit exceeded",
  } as RateLimitConfig,

  // Auth - 5 requests per 15 minutes
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: "Too many login attempts",
    statusCode: 401,
  } as RateLimitConfig,

  // Search - 30 requests per minute
  search: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: "Search rate limit exceeded",
  } as RateLimitConfig,
};

/**
 * User-based rate limiting (authenticated users)
 */
export class UserRateLimiter {
  private limitersByUser: Map<string, RateLimiter> = new Map();

  constructor(private config: RateLimitConfig) {}

  async isAllowed(userId: string, action: string = "default"): Promise<boolean> {
    const key = `user:${userId}:${action}`;
    const limiter = this.getLimiter(key);
    const result = await limiter.isAllowed(key);
    return result.allowed;
  }

  private getLimiter(key: string): RateLimiter {
    if (!this.limitersByUser.has(key)) {
      this.limitersByUser.set(key, new RateLimiter(this.config, new InMemoryRateLimitStore()));
    }
    return this.limitersByUser.get(key)!;
  }
}

/**
 * IP-based rate limiting (non-authenticated)
 */
export class IpRateLimiter {
  private limitersByIp: Map<string, RateLimiter> = new Map();

  constructor(private config: RateLimitConfig) {}

  async isAllowed(ip: string): Promise<boolean> {
    const limiter = this.getLimiter(ip);
    const result = await limiter.isAllowed(ip);
    return result.allowed;
  }

  private getLimiter(ip: string): RateLimiter {
    if (!this.limitersByIp.has(ip)) {
      this.limitersByIp.set(ip, new RateLimiter(this.config, new InMemoryRateLimitStore()));
    }
    return this.limitersByIp.get(ip)!;
  }
}

/**
 * Composite rate limiter for different endpoints
 */
export const createEndpointRateLimiters = () => {
  return {
    // API endpoints
    "/api/products": new RateLimiter(rateLimitConfigs.loose),
    "/api/categories": new RateLimiter(rateLimitConfigs.loose),
    "/api/search": new RateLimiter(rateLimitConfigs.search),

    // Auth endpoints
    "/api/auth/login": new RateLimiter(rateLimitConfigs.auth),
    "/api/auth/register": new RateLimiter(rateLimitConfigs.auth),
    "/api/auth/forgot-password": new RateLimiter(rateLimitConfigs.strict),

    // Checkout endpoints
    "/api/orders": new RateLimiter(rateLimitConfigs.standard),
    "/api/payment": new RateLimiter(rateLimitConfigs.standard),

    // Admin endpoints
    "/api/admin": new RateLimiter(rateLimitConfigs.strict),
  };
};
