/* eslint-disable no-console */
import Redis from "ioredis";

declare global {
  var redis: Redis | undefined;
}

const redisClient = global.redis || new Redis(process.env.REDIS_URL || "redis://localhost:6379");

if (process.env.NODE_ENV === "production") {
  global.redis = redisClient;
}

redisClient.on("connect", () => console.log("Redis connected!"));
redisClient.on("error", (err) => console.error("Redis Client Error", err));

export const redis = redisClient;

// Cache utility functions
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: unknown, ttl?: number): Promise<"OK" | null> {
    const data = JSON.stringify(value);
    if (ttl) {
      return redis.set(key, data, "EX", ttl);
    }
    return redis.set(key, data);
  },

  async del(key: string | string[]): Promise<number> {
    return Array.isArray(key) ? redis.del(...key) : redis.del(key);
  },

  async clear(): Promise<string> {
    return redis.flushdb();
  },
};

// Typed cache keys using enums
export enum CacheKeys {
  PRODUCTS = "products",
  PRODUCT_BY_SLUG = "product_by_slug",
  CATEGORIES = "categories",
  USER_SESSION = "user_session",
}

// TTL configurations for different data types (in seconds)
export const CacheTTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 5 * 60,
  TEN_MINUTES: 10 * 60,
  ONE_HOUR: 60 * 60,
  ONE_DAY: 24 * 60 * 60,
  ONE_WEEK: 7 * 24 * 60 * 60,
};
