import { PrismaClient } from "@prisma/client";

// Prompt 128: Database Query Optimization

/**
 * Performance monitoring for database queries
 */
export class QueryPerformanceMonitor {
  private queries: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  startQuery(queryName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const existing = this.queries.get(queryName) || { count: 0, totalTime: 0, avgTime: 0 };
      const newCount = existing.count + 1;
      const newTotalTime = existing.totalTime + duration;
      const newAvgTime = newTotalTime / newCount;

      this.queries.set(queryName, {
        count: newCount,
        totalTime: newTotalTime,
        avgTime: newAvgTime,
      });
    };
  }

  getStats(queryName?: string) {
    if (queryName) {
      return this.queries.get(queryName);
    }
    return Object.fromEntries(this.queries);
  }

  reset() {
    this.queries.clear();
  }
}

/**
 * Batch query executor - avoid N+1 queries
 */
export class BatchQueryExecutor<T> {
  private batch: any[] = [];
  private timer: NodeJS.Timeout | null = null;
  private batchSize: number;
  private batchDelay: number;

  constructor(
    private executor: (items: any[]) => Promise<T[]>,
    batchSize: number = 100,
    batchDelay: number = 10
  ) {
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  async add(item: any): Promise<T> {
    this.batch.push(item);

    if (this.batch.length >= this.batchSize) {
      return this.flush();
    }

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchDelay);
    }

    return new Promise((resolve) => {
      // Items will be resolved when batch is flushed
      const resolveWhenReady = (items: T[]) => {
        const index = this.batch.indexOf(item);
        resolve(items[index]);
      };
    });
  }

  async flush(): Promise<any> {
    if (this.batch.length === 0) return null;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const itemsToProcess = this.batch;
    this.batch = [];

    return this.executor(itemsToProcess);
  }
}

/**
 * Query optimization utilities
 */
export class QueryOptimizer {
  /**
   * Add database indexes for common queries
   * Run this migration manually or through Prisma migrations
   */
  static getRecommendedIndexes() {
    return [
      // Users
      "CREATE INDEX idx_users_email ON users(email);",
      "CREATE INDEX idx_users_created_at ON users(created_at);",

      // Products
      "CREATE INDEX idx_products_slug ON products(slug);",
      "CREATE INDEX idx_products_category_id ON products(category_id);",
      "CREATE INDEX idx_products_created_at ON products(created_at);",
      "CREATE INDEX idx_products_featured ON products(featured);",
      "CREATE INDEX idx_products_price ON products(price);",

      // Categories
      "CREATE INDEX idx_categories_slug ON categories(slug);",
      "CREATE INDEX idx_categories_parent_id ON categories(parent_id);",

      // Orders
      "CREATE INDEX idx_orders_user_id ON orders(user_id);",
      "CREATE INDEX idx_orders_status ON orders(status);",
      "CREATE INDEX idx_orders_created_at ON orders(created_at);",
      "CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);",

      // Cart Items
      "CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);",
      "CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);",

      // Reviews
      "CREATE INDEX idx_reviews_product_id ON reviews(product_id);",
      "CREATE INDEX idx_reviews_user_id ON reviews(user_id);",
      "CREATE INDEX idx_reviews_rating ON reviews(rating);",

      // Wishlist
      "CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);",
      "CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);",
    ];
  }

  /**
   * Get optimal select columns to reduce data transfer
   */
  static getOptimalSelects() {
    return {
      user: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
      product: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        rating: true,
        stock: true,
      },
      order: {
        id: true,
        orderNumber: true,
        userId: true,
        total: true,
        status: true,
        createdAt: true,
      },
      category: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
    };
  }
}

/**
 * Pagination helper
 */
export class PaginationHelper {
  static getPaginationParams(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }

  static calculatePages(total: number, limit: number) {
    return Math.ceil(total / limit);
  }

  static getPaginationMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      pages: this.calculatePages(total, limit),
      hasNext: page < this.calculatePages(total, limit),
      hasPrev: page > 1,
    };
  }
}

/**
 * Connection pooling configuration for Prisma
 */
export const getPrismaConfig = () => {
  return {
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Client extensions for query optimization
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
  };
};

/**
 * Apply query timeouts to prevent hanging queries
 */
export const withQueryTimeout = async <T>(
  fn: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> => {
  return Promise.race<T>([
    fn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
};

/**
 * Optimize findMany queries - select only needed fields
 */
type PrismaModelName = keyof ReturnType<typeof QueryOptimizer.getOptimalSelects>;

export const optimizedFindMany = async (
  prisma: PrismaClient,
  model: PrismaModelName,
  options: any = {}
) => {
  const defaults = {
    take: 20,
    skip: 0,
    select: QueryOptimizer.getOptimalSelects()[model],
  };

  // Ensure the model exists and has a findMany method
  if (!(model in prisma) || typeof (prisma[model] as any).findMany !== 'function') {
    throw new Error(`Model '${String(model)}' not found or does not have a findMany method on PrismaClient.`);
  }

  return (prisma[model] as any).findMany({
    ...defaults,
    ...options,
  });
};

/**
 * Avoid N+1 queries - batch load related items
 */
export const batchLoadRelations = async (
  items: any[],
  relation: string,
  loader: (ids: string[]) => Promise<any[]>
) => {
  const ids = [...new Set(items.map((item) => item.id))];
  const related = await loader(ids);

  const relatedMap = new Map();
  related.forEach((item) => {
    if (!relatedMap.has(item.parentId)) {
      relatedMap.set(item.parentId, []);
    }
    relatedMap.get(item.parentId).push(item);
  });

  return items.map((item) => ({
    ...item,
    [relation]: relatedMap.get(item.id) || [],
  }));
};
