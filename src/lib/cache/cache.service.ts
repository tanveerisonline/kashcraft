import Redis from "ioredis";

// Prompt 127: Caching Strategy

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number;
  redisUrl?: string;
}

/**
 * Cache Manager - Handle both Redis and in-memory caching
 */
export class CacheManager {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { data: any; expiresAt: number }> = new Map();
  private config: CacheConfig;
  private prefix: string = "kashcraft:";

  constructor(config: CacheConfig = { enabled: true, defaultTTL: 3600 }) {
    this.config = config;
    this.initializeRedis();
  }

  private initializeRedis() {
    if (this.config.enabled && this.config.redisUrl) {
      try {
        this.redis = new Redis(this.config.redisUrl, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
        });

        this.redis.on("error", (err) => {
          console.error("Redis connection error:", err);
          // Fall back to in-memory caching
          this.redis = null;
        });
      } catch (error) {
        console.error("Failed to initialize Redis:", error);
        this.redis = null;
      }
    }
  }

  /**
   * Get cache key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getKey(key);

      // Try Redis first
      if (this.redis?.status === "ready") {
        const value = await this.redis.get(cacheKey);
        if (value) return JSON.parse(value);
        return null;
      }

      // Fall back to in-memory cache
      const cached = this.memoryCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      if (cached) {
        this.memoryCache.delete(cacheKey);
      }

      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.config.defaultTTL;
      const cacheKey = this.getKey(key);
      const serialized = JSON.stringify(value);

      // Try Redis first
      if (this.redis?.status === "ready") {
        await this.redis.setex(cacheKey, ttl, serialized);
        return true;
      }

      // Fall back to in-memory cache
      this.memoryCache.set(cacheKey, {
        data: value,
        expiresAt: Date.now() + ttl * 1000,
      });

      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<boolean> {
    try {
      const cacheKey = this.getKey(key);

      if (this.redis?.status === "ready") {
        await this.redis.del(cacheKey);
        return true;
      }

      this.memoryCache.delete(cacheKey);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache entries with prefix
   */
  async clear(): Promise<boolean> {
    try {
      if (this.redis?.status === "ready") {
        const pattern = `${this.prefix}*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return true;
      }

      this.memoryCache.clear();
      return true;
    } catch (error) {
      console.error("Cache clear error:", error);
      return false;
    }
  }

  /**
   * Get or set cache - cache-aside pattern
   */
  async getOrSet<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached) return cached;

      // Fetch if not in cache
      const value = await fetcher();

      // Store in cache
      await this.set(key, value, options);

      return value;
    } catch (error) {
      console.error(`Cache getOrSet error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const fullPattern = `${this.prefix}${pattern}`;

      if (this.redis?.status === "ready") {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return keys.length;
      }

      // In-memory cache pattern invalidation
      let count = 0;
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key);
          count++;
        }
      }

      return count;
    } catch (error) {
      console.error(`Cache invalidate pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  /**
   * Get cache stats
   */
  async getStats() {
    const memorySize = this.memoryCache.size;
    let redisInfo = null;

    if (this.redis?.status === "ready") {
      try {
        redisInfo = await this.redis.info("stats");
      } catch (error) {
        console.error("Failed to get Redis stats:", error);
      }
    }

    return {
      memory: memorySize,
      redis: redisInfo,
      isRedisConnected: this.redis?.status === "ready",
    };
  }
}

/**
 * Product Cache utilities
 */
export class ProductCacheService {
  constructor(private cache: CacheManager) {}

  async getProduct(id: string) {
    return this.cache.get(`product:${id}`);
  }

  async setProduct(id: string, data: any, ttl: number = 3600) {
    return this.cache.set(`product:${id}`, data, { ttl });
  }

  async invalidateProduct(id: string) {
    return this.cache.delete(`product:${id}`);
  }

  async getProducts(page: number, limit: number) {
    return this.cache.get(`products:${page}:${limit}`);
  }

  async setProducts(page: number, limit: number, data: any, ttl: number = 1800) {
    return this.cache.set(`products:${page}:${limit}`, data, { ttl });
  }

  async invalidateProducts() {
    return this.cache.invalidatePattern("products:*");
  }

  async getProductsByCategory(categoryId: string) {
    return this.cache.get(`category:${categoryId}:products`);
  }

  async setProductsByCategory(categoryId: string, data: any, ttl: number = 1800) {
    return this.cache.set(`category:${categoryId}:products`, data, { ttl });
  }

  async invalidateCategory(categoryId: string) {
    return this.cache.invalidatePattern(`category:${categoryId}:*`);
  }
}

/**
 * Category Cache utilities
 */
export class CategoryCacheService {
  constructor(private cache: CacheManager) {}

  async getCategories() {
    return this.cache.get("categories:all");
  }

  async setCategories(data: any, ttl: number = 3600) {
    return this.cache.set("categories:all", data, { ttl });
  }

  async invalidateCategories() {
    return this.cache.delete("categories:all");
  }

  async getCategoryTree() {
    return this.cache.get("categories:tree");
  }

  async setCategoryTree(data: any, ttl: number = 3600) {
    return this.cache.set("categories:tree", data, { ttl });
  }
}

/**
 * User/Session Cache utilities
 */
export class SessionCacheService {
  constructor(private cache: CacheManager) {}

  async getSession(sessionId: string) {
    return this.cache.get(`session:${sessionId}`);
  }

  async setSession(sessionId: string, data: any, ttl: number = 86400) {
    return this.cache.set(`session:${sessionId}`, data, { ttl });
  }

  async invalidateSession(sessionId: string) {
    return this.cache.delete(`session:${sessionId}`);
  }

  async getCart(userId: string) {
    return this.cache.get(`cart:${userId}`);
  }

  async setCart(userId: string, data: any, ttl: number = 86400) {
    return this.cache.set(`cart:${userId}`, data, { ttl });
  }

  async invalidateCart(userId: string) {
    return this.cache.delete(`cart:${userId}`);
  }

  async getUserWishlist(userId: string) {
    return this.cache.get(`wishlist:${userId}`);
  }

  async setUserWishlist(userId: string, data: any, ttl: number = 86400) {
    return this.cache.set(`wishlist:${userId}`, data, { ttl });
  }

  async invalidateUserData(userId: string) {
    return this.cache.invalidatePattern(`user:${userId}:*`);
  }
}

/**
 * Initialize global cache instance
 */
export const initCache = (config?: CacheConfig): CacheManager => {
  return new CacheManager(
    config || {
      enabled: process.env.NODE_ENV === "production",
      defaultTTL: parseInt(process.env.CACHE_TTL || "3600"),
      redisUrl: process.env.REDIS_URL,
    }
  );
};

// Export singleton instance
export const globalCache = initCache();
