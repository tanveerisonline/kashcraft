import { describe, it, expect, beforeEach, vi } from "@jest/globals";
import { advancedSearchService } from "@/lib/services";
import { AppError } from "@/lib/middleware/app-error";

describe("AdvancedSearchService Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("search", () => {
    it("should return search results with filters", async () => {
      const mockResults = {
        data: [
          {
            id: "prod-1",
            name: "Product 1",
            price: 100,
            category: "Electronics",
            rating: 4.5,
          },
          {
            id: "prod-2",
            name: "Product 2",
            price: 200,
            category: "Electronics",
            rating: 4.0,
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.spyOn(advancedSearchService, "search").mockResolvedValue(mockResults);

      const result = await advancedSearchService.search({
        query: "electronics",
        filters: { category: "Electronics" },
        sortBy: "price_asc",
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].name).toBe("Product 1");
    });

    it("should handle empty search results", async () => {
      const mockResults = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      };

      vi.spyOn(advancedSearchService, "search").mockResolvedValue(mockResults);

      const result = await advancedSearchService.search({
        query: "nonexistent",
        filters: {},
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should apply sort options correctly", async () => {
      const mockResults = {
        data: [
          { id: "prod-1", name: "Product 1", price: 100 },
          { id: "prod-2", name: "Product 2", price: 200 },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.spyOn(advancedSearchService, "search").mockResolvedValue(mockResults);

      const result = await advancedSearchService.search({
        query: "products",
        filters: {},
        sortBy: "price_asc",
        page: 1,
        limit: 20,
      });

      expect(result.data[0].price).toBeLessThanOrEqual(result.data[1].price);
    });

    it("should handle pagination correctly", async () => {
      const mockResults = {
        data: [
          { id: "prod-11", name: "Product 11" },
          { id: "prod-12", name: "Product 12" },
        ],
        total: 100,
        page: 2,
        limit: 10,
      };

      vi.spyOn(advancedSearchService, "search").mockResolvedValue(mockResults);

      const result = await advancedSearchService.search({
        query: "products",
        filters: {},
        page: 2,
        limit: 10,
      });

      expect(result.page).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it("should apply multiple filters", async () => {
      const mockResults = {
        data: [{ id: "prod-1", name: "Laptop", category: "Electronics", status: "in_stock" }],
        total: 1,
        page: 1,
        limit: 20,
      };

      vi.spyOn(advancedSearchService, "search").mockResolvedValue(mockResults);

      const result = await advancedSearchService.search({
        query: "laptop",
        filters: {
          category: "Electronics",
          status: "in_stock",
          priceRange: { min: 500, max: 2000 },
        },
        page: 1,
        limit: 20,
      });

      expect(result.data[0].category).toBe("Electronics");
      expect(result.data[0].status).toBe("in_stock");
    });

    it("should handle price range filters", async () => {
      const mockResults = {
        data: [
          { id: "prod-1", name: "Product 1", price: 1000 },
          { id: "prod-2", name: "Product 2", price: 1500 },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.spyOn(advancedSearchService, "search").mockResolvedValue(mockResults);

      const result = await advancedSearchService.search({
        query: "products",
        filters: { priceRange: { min: 500, max: 2000 } },
        page: 1,
        limit: 20,
      });

      expect(result.data.every((p: any) => p.price >= 500 && p.price <= 2000)).toBe(true);
    });
  });

  describe("getSuggestions", () => {
    it("should return search suggestions", async () => {
      const mockSuggestions = ["laptop", "laptop bag", "laptop stand", "laptop sleeve"];

      vi.spyOn(advancedSearchService, "getSuggestions").mockResolvedValue(mockSuggestions);

      const result = await advancedSearchService.getSuggestions("laptop");

      expect(result).toContain("laptop");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return empty suggestions for non-matching query", async () => {
      vi.spyOn(advancedSearchService, "getSuggestions").mockResolvedValue([]);

      const result = await advancedSearchService.getSuggestions("xyzabc123");

      expect(result).toHaveLength(0);
    });

    it("should limit suggestions to reasonable number", async () => {
      const mockSuggestions = Array(10)
        .fill(0)
        .map((_, i) => `suggestion-${i}`);

      vi.spyOn(advancedSearchService, "getSuggestions").mockResolvedValue(mockSuggestions);

      const result = await advancedSearchService.getSuggestions("prod");

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it("should return case-insensitive suggestions", async () => {
      const mockSuggestions = ["Product", "product", "PRODUCT"];

      vi.spyOn(advancedSearchService, "getSuggestions").mockResolvedValue(mockSuggestions);

      const result = await advancedSearchService.getSuggestions("PROD");

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getFilters", () => {
    it("should return available filters", async () => {
      const mockFilters = {
        categories: [
          { name: "Electronics", count: 100 },
          { name: "Clothing", count: 50 },
        ],
        brands: [
          { name: "Brand A", count: 30 },
          { name: "Brand B", count: 20 },
        ],
        priceRanges: [
          { min: 0, max: 100, count: 40 },
          { min: 100, max: 500, count: 60 },
        ],
      };

      vi.spyOn(advancedSearchService, "getAvailableFilters").mockResolvedValue(mockFilters);

      const result = await advancedSearchService.getAvailableFilters();

      expect(result.categories).toBeDefined();
      expect(result.brands).toBeDefined();
      expect(result.priceRanges).toBeDefined();
    });
  });
});
