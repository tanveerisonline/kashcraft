/**
 * Advanced Search and Faceted Filtering Service
 * Provides faceted search, range filters, multi-select filters, and search history
 */

import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export interface SearchFilter {
  field: string;
  values: string[] | { min?: number; max?: number };
  operator?: "AND" | "OR";
}

export interface SearchOptions {
  query?: string;
  filters?: SearchFilter[];
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "popular" | "rating";
  page?: number;
  limit?: number;
  userId?: string;
}

export interface SearchResult {
  products: any[];
  total: number;
  page: number;
  limit: number;
  facets: Facet[];
}

export interface Facet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  label: string;
  value: string;
  count: number;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  filters: string | null; // Changed to string | null to match Prisma's return type
  timestamp: Date;
  resultCount: number;
  clickedProduct: string | null; // Changed to string | null
}

export interface PopularSearch {
  query: string;
  _count: {
    query: number;
  };
}

/**
 * Advanced search service with faceting, filtering, and history
 */
export class AdvancedSearchService {
  private static instance: AdvancedSearchService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AdvancedSearchService {
    if (!AdvancedSearchService.instance) {
      AdvancedSearchService.instance = new AdvancedSearchService();
    }
    return AdvancedSearchService.instance;
  }

  /**
   * Search products with filters and facets
   */
  async search(options: SearchOptions): Promise<SearchResult> {
    try {
      const {
        query = "",
        filters = [],
        sortBy = "relevance",
        page = 1,
        limit = 20,
        userId,
      } = options;

      // Build where clause
      const where: any = {
        isActive: true,
      };

      // Text search
      if (query) {
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ];
      }

      // Apply filters
      applyFilters(where, filters);

      // Determine sort
      let orderBy: any = { createdAt: "desc" };
      if (sortBy === "price_asc") {
        orderBy = { price: "asc" };
      } else if (sortBy === "price_desc") {
        orderBy = { price: "desc" };
      } else if (sortBy === "popular") {
        orderBy = { sales: "desc" };
      } else if (sortBy === "rating") {
        orderBy = { averageRating: "desc" };
      }

      // Get total count
      const total = await prisma.product.count({ where });

      // Get products
      const products = await prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          inventory: { select: { quantity: true } },
          reviews: { select: { rating: true } },
        },
      });

      // Calculate facets
      const facets = await calculateFacets(where);

      // Record search history
      if (userId) {
        await recordSearchHistory(userId, query, filters, total);
      }

      return {
        products,
        total,
        page,
        limit,
        facets,
      };
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      if (!query || query.length < 2) return [];

      // Get from products
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { name: true },
        take: limit,
      });

      // Get from categories
      const categories = await prisma.category.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        select: { name: true },
        take: limit / 2,
      });

      const suggestions = [...products.map((p) => p.name), ...categories.map((c) => c.name)].slice(
        0,
        limit
      );

      return [...new Set(suggestions)]; // Remove duplicates
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return [];
    }
  }

  /**
   * Get search history for user
   */
  async getSearchHistory(userId: string, limit: number = 10): Promise<SearchHistory[]> {
    try {
      return await prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: limit,
      });
    } catch (error) {
      console.error("Error getting search history:", error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(userId: string): Promise<void> {
    try {
      await prisma.searchHistory.deleteMany({
        where: { userId },
      });
    } catch (error) {
      console.error("Error clearing search history:", error);
      throw error;
    }
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
    try {
      const popularSearches = await prisma.searchHistory.groupBy({
        by: ["query"],
        _count: { query: true },
        orderBy: [{ _count: { query: "desc" } }],
        take: limit,
      });
      return popularSearches as PopularSearch[];
    } catch (error) {
      console.error("Error getting popular searches:", error);
      return [];
    }
  }

  /**
   * Record a product click in search results
   */
  async recordSearchClick(userId: string, query: string, productId: string): Promise<void> {
    try {
      const history = await prisma.searchHistory.findFirst({
        where: { userId, query },
        orderBy: { timestamp: "desc" },
      });

      if (history) {
        await prisma.searchHistory.update({
          where: { id: history.id },
          data: { clickedProduct: productId },
        });
      }
    } catch (error) {
      console.error("Error recording search click:", error);
    }
  }
}

/**
 * Record search in history
 */
async function recordSearchHistory(
  userId: string,
  query: string,
  filters: SearchFilter[],
  resultCount: number
): Promise<void> {
  try {
    await prisma.searchHistory.create({
      data: {
        userId,
        query,
        resultCount,
      },
    });
  } catch (error) {
    console.error("Error recording search history:", error);
  }
}

/**
 * Apply filters to where clause
 */
function applyFilters(where: any, filters: SearchFilter[]): void {
  for (const filter of filters) {
    if (filter.field === "category") {
      where.categoryId = {
        in: Array.isArray(filter.values) ? filter.values : [],
      };
    } else if (filter.field === "price") {
      if (typeof filter.values === "object" && "min" in filter.values) {
        where.price = {
          gte: filter.values.min || 0,
          lte: filter.values.max || Infinity,
        };
      }
    } else if (filter.field === "rating") {
      where.averageRating = {
        gte: parseInt(filter.values as any),
      };
    } else if (filter.field === "inStock") {
      if (typeof filter.values === "string" && filter.values === "true") {
        where.inventory = { quantity: { gt: 0 } };
      } else if (typeof filter.values === "boolean" && filter.values === true) {
        where.inventory = { quantity: { gt: 0 } };
      }
    } else if (filter.field === "brand") {
      where.brand = {
        in: Array.isArray(filter.values) ? filter.values : [],
      };
    }
  }
}

/**
 * Calculate facets for current results
 */
async function calculateFacets(where: any): Promise<Facet[]> {
  try {
    const facets: Facet[] = [];

    // Get category facet
    const categories = await getFacet("category", where);
    if (categories.values.length > 0) facets.push(categories);

    // Get price facet
    const price = await getFacet("price", where);
    if (price.values.length > 0) facets.push(price);

    // Get rating facet
    const rating = await getFacet("rating", where);
    if (rating.values.length > 0) facets.push(rating);

    // Get stock facet
    const stock = await getFacet("inStock", where);
    if (stock.values.length > 0) facets.push(stock);

    return facets;
  } catch (error) {
    console.error("Error calculating facets:", error);
    return [];
  }
}

/**
 * Get faceted results for a specific field
 */
async function getFacet(field: string, where?: any): Promise<Facet> {
  try {
    let values: FacetValue[] = [];

    if (field === "category") {
      const categories = await prisma.category.findMany({
        include: {
          products: {
            where: where || { isActive: true },
            select: { id: true },
          },
        },
      });

      values = categories
        .filter((cat) => cat.products.length > 0)
        .map((cat) => ({
          label: cat.name,
          value: cat.id,
          count: cat.products.length,
        }));
    } else if (field === "price") {
      // Price ranges
      const priceRanges = [
        { label: "Under $50", min: 0, max: 50 },
        { label: "$50 - $100", min: 50, max: 100 },
        { label: "$100 - $500", min: 100, max: 500 },
        { label: "$500+", min: 500, max: Infinity },
      ];

      for (const range of priceRanges) {
        const count = await prisma.product.count({
          where: {
            ...where,
            price: { gte: range.min, lte: range.max },
          },
        });

        if (count > 0) {
          values.push({
            label: range.label,
            value: `${range.min}-${range.max}`,
            count,
          });
        }
      }
    } else if (field === "rating") {
      // Rating facets
      for (let rating = 5; rating >= 1; rating--) {
        const count = await prisma.product.count({
          where: {
            ...where,
            averageRating: { gte: rating, lt: rating + 1 },
          },
        });

        if (count > 0) {
          values.push({
            label: `${rating}+ stars`,
            value: rating.toString(),
            count,
          });
        }
      }
    } else if (field === "inStock") {
      const inStock = await prisma.product.count({
        where: {
          ...where,
          inventory: { quantity: { gt: 0 } },
        },
      });

      const outOfStock = await prisma.product.count({
        where: {
          ...where,
          inventory: { quantity: { lte: 0 } },
        },
      });

      if (inStock > 0) {
        values.push({
          label: "In Stock",
          value: "true",
          count: inStock,
        });
      }

      if (outOfStock > 0) {
        values.push({
          label: "Out of Stock",
          value: "false",
          count: outOfStock,
        });
      }
    }

    return { field, values };
  } catch (error) {
    console.error("Error getting facet:", error);
    throw error;
  }
}
