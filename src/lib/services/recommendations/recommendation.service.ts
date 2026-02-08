/**
 * Personalized Recommendations Engine
 * Generates product recommendations based on:
 * - Frequently bought together
 * - Similar products
 * - Personalized recommendations (based on user history and preferences)
 */

import prisma from "@/lib/db/prisma";

export interface RecommendationResult {
  productId: string;
  score: number;
  reason: string;
}

export interface Recommendation {
  products: any[];
  type: "frequently_bought_together" | "similar" | "personalized" | "trending";
  reason: string;
}

/**
 * Recommendation engine with collaborative and content-based filtering
 */
export class RecommendationEngine {
  private static instance: RecommendationEngine;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  /**
   * Get frequently bought together recommendations
   */
  async getFrequentlyBoughtTogether(productId: string, limit: number = 5): Promise<Recommendation> {
    try {
      // Get orders containing this product
      const orders = await prisma.order.findMany({
        where: {
          items: {
            some: { productId },
          },
        },
        select: {
          items: {
            select: { productId: true },
          },
        },
        take: 100,
      });

      // Count product occurrences
      const productCounts: Record<string, number> = {};
      for (const order of orders) {
        for (const item of order.items) {
          if (item.productId !== productId) {
            productCounts[item.productId] = (productCounts[item.productId] || 0) + 1;
          }
        }
      }

      // Get top products
      const topProducts = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([pId]) => pId);

      const products = await prisma.product.findMany({
        where: { id: { in: topProducts } },
        include: {
          inventory: { select: { quantity: true } },
          reviews: { select: { rating: true } },
        },
      });

      return {
        products,
        type: "frequently_bought_together",
        reason: "Frequently bought with this product",
      };
    } catch (error) {
      console.error("Error getting frequently bought together:", error);
      return { products: [], type: "frequently_bought_together", reason: "" };
    }
  }

  /**
   * Get similar products
   */
  async getSimilarProducts(productId: string, limit: number = 5): Promise<Recommendation> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          categoryId: true,
          price: true,

        },
      });

      if (!product) {
        return { products: [], type: "similar", reason: "" };
      }

      // Find similar products by category and price range
      const similar = await prisma.product.findMany({
        where: {
          AND: [
            { id: { not: productId } },
            { categoryId: product.categoryId },
            {
              price: {
                gte: Number(product.price) * 0.7,
                lte: Number(product.price) * 1.3,
              },
            },
            { isActive: true },
          ],
        },
        take: limit,
        include: {
          inventory: { select: { quantity: true } },
          reviews: { select: { rating: true } },
        },
      });

      const similarWithAvgRating = similar.map((product) => {
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
        return { ...product, averageRating };
      });

      similarWithAvgRating.sort((a, b) => b.averageRating - a.averageRating);

      return {
        products: similarWithAvgRating,
        type: "similar",
        reason: "Similar products you might like",
      };
    } catch (error) {
      console.error("Error getting similar products:", error);
      return { products: [], type: "similar", reason: "" };
    }
  }

  /**
   * Get personalized recommendations for user
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<Recommendation> {
    try {
      // Get user's purchase history
      const userOrders = await prisma.order.findMany({
        where: { userId },
        select: {
          items: {
            select: {
              product: {
                select: {
                  id: true,
                  categoryId: true,
                  price: true,
                },
              },
            },
          },
        },
        take: 20,
      });

      if (userOrders.length === 0) {
        // No purchase history - return trending products
        return this.getTrendingProducts(limit);
      }

      // Calculate user preferences
      const categoryPreferences: Record<string, number> = {};
      let totalSpent = 0;
      const purchasedIds = new Set<string>();

      for (const order of userOrders) {
        for (const item of order.items) {
          const categoryId = item.product.categoryId;
          categoryPreferences[categoryId] = (categoryPreferences[categoryId] || 0) + 1;
          totalSpent += Number(item.product.price);
          purchasedIds.add(item.product.id);
        }
      }

      const avgPrice = totalSpent / userOrders.reduce((sum, o) => sum + o.items.length, 1);

      // Get products matching preferences
      const topCategories = Object.entries(categoryPreferences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat);

      const recommendations = await prisma.product.findMany({
        where: {
          AND: [
            { categoryId: { in: topCategories } },
            { id: { notIn: Array.from(purchasedIds) } },
            {
              price: {
                gte: avgPrice * 0.6,
                lte: avgPrice * 1.4,
              },
            },
            { isActive: true },
          ],
        },
        orderBy: [], // Removed sales from orderBy
        take: limit,
        include: {
          inventory: { select: { quantity: true } },
          reviews: { select: { rating: true } },
          orderItems: { select: { quantity: true } }, // Include orderItems to calculate sales
        },
      });

      const recommendationsWithDerivedMetrics = recommendations.map((product) => {
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
        const sales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0); // Calculate sales
        return { ...product, averageRating, sales };
      });

      recommendationsWithDerivedMetrics.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.sales - a.sales;
      });

      return {
        products: recommendationsWithDerivedMetrics,
        type: "personalized",
        reason: "Based on your interests and purchase history",
      };
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      return { products: [], type: "personalized", reason: "" };
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit: number = 10): Promise<Recommendation> {
    try {
      // Trending = high sales in last 30 days + good rating
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: [], // Removed sales from orderBy
        take: limit,
        include: {
          inventory: { select: { quantity: true } },
          reviews: { select: { rating: true } },
          orderItems: { select: { quantity: true } }, // Include orderItems to calculate sales
        },
      });

      const productsWithDerivedMetrics = products.map((product) => {
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
        const sales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0); // Calculate sales
        return { ...product, averageRating, sales };
      });

      productsWithDerivedMetrics.sort((a, b) => {
        if (b.sales !== a.sales) {
          return b.sales - a.sales;
        }
        return b.averageRating - a.averageRating;
      });

      return {
        products: productsWithDerivedMetrics,
        type: "trending",
        reason: "Trending now",
      };
    } catch (error) {
      console.error("Error getting trending products:", error);
      return { products: [], type: "trending", reason: "" };
    }
  }

  /**
   * Get all recommendations for a product
   */
  async getProductRecommendations(productId: string, userId?: string): Promise<Recommendation[]> {
    try {
      const recommendations: Recommendation[] = [];

      // Get frequently bought together
      const fbt = await this.getFrequentlyBoughtTogether(productId, 4);
      if (fbt.products.length > 0) {
        recommendations.push(fbt);
      }

      // Get similar products
      const similar = await this.getSimilarProducts(productId, 4);
      if (similar.products.length > 0) {
        recommendations.push(similar);
      }

      // Get personalized if user provided
      if (userId) {
        const personalized = await this.getPersonalizedRecommendations(userId, 4);
        if (personalized.products.length > 0) {
          recommendations.push(personalized);
        }
      }

      return recommendations;
    } catch (error) {
      console.error("Error getting product recommendations:", error);
      return [];
    }
  }

  /**
   * Get recommendations for homepage
   */
  async getHomepageRecommendations(userId?: string): Promise<any[]> {
    try {
      const sections = [];

      // 1. Trending products
      const trending = await this.getTrendingProducts(6);
      sections.push({
        title: "Trending Now",
        products: trending.products,
        type: "trending",
      });

      // 2. Personalized or featured
      if (userId) {
        const personalized = await this.getPersonalizedRecommendations(userId, 6);
        sections.push({
          title: "Recommended For You",
          products: personalized.products,
          type: "personalized",
        });
      } else {
        // Show best sellers
        const bestSellers = await prisma.product.findMany({
          where: { isActive: true },
          orderBy: [], // Removed sales from orderBy
          take: 6,
          include: {
            inventory: { select: { quantity: true } },
            reviews: { select: { rating: true } },
            orderItems: { select: { quantity: true } }, // Include orderItems to calculate sales
          },
        });

        const bestSellersWithDerivedMetrics = bestSellers.map((product) => {
          const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
          const sales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0); // Calculate sales
          return { ...product, averageRating, sales };
        });

        bestSellersWithDerivedMetrics.sort((a, b) => b.sales - a.sales);

        sections.push({
          title: "Best Sellers",
          products: bestSellersWithDerivedMetrics,
          type: "popular",
        });
      }

      // 3. New arrivals
      const newArrivals = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          inventory: { select: { quantity: true } },
          reviews: { select: { rating: true } },
        },
      });

      const newArrivalsWithAvgRating = newArrivals.map((product) => {
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
        return { ...product, averageRating };
      });

      newArrivalsWithAvgRating.sort((a, b) => b.averageRating - a.averageRating);

      sections.push({
        title: "New Arrivals",
        products: newArrivalsWithAvgRating,
        type: "new",
      });

      return sections;
    } catch (error) {
      console.error("Error getting homepage recommendations:", error);
      return [];
    }
  }

  /**
   * Calculate similarity score between two products
   */
  private calculateSimilarity(product1: any, product2: any): number {
    let score = 0;

    // Same category: +40 points
    if (product1.categoryId === product2.categoryId) {
      score += 40;
    }

    // Price similarity: +30 points (if within 20% range)
    const priceDiff = Math.abs(product1.price - product2.price) / product1.price;
    if (priceDiff < 0.2) {
      score += 30;
    }

    // Rating similarity: +20 points
    if (product1.averageRating && product2.averageRating) {
      const ratingDiff = Math.abs(product1.averageRating - product2.averageRating);
      if (ratingDiff < 1) {
        score += 20;
      }
    }

    // Similar sales: +10 points
    if (product1.sales > 0 && product2.sales > 0) {
      const salesDiff =
        Math.abs(product1.sales - product2.sales) / Math.max(product1.sales, product2.sales);
      if (salesDiff < 0.3) {
        score += 10;
      }
    }

    return score;
  }
}

// Export singleton instance
export const recommendationEngine = RecommendationEngine.getInstance();
