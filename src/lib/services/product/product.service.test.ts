import { ProductService } from "@/lib/services/product/product.service";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { CacheService } from "@/lib/services/cache/cache.service";
import { IUploadService } from "@/lib/services/upload/upload.interface";
import { productFactory } from "@/test/factories";

describe("ProductService", () => {
  let productService: ProductService;
  let mockProductRepo: jest.Mocked<ProductRepository>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockUploadService: jest.Mocked<IUploadService>;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>;

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    mockUploadService = {
      upload: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUploadService>;

    productService = new ProductService(mockProductRepo, mockCacheService, mockUploadService);
  });

  describe("getProductById", () => {
    it("should return product from cache if available", async () => {
      const mockProduct = productFactory.create();
      mockCacheService.get.mockResolvedValue(mockProduct);

      const result = await productService.getProductById(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(mockCacheService.get).toHaveBeenCalledWith(`product:${mockProduct.id}`);
      expect(mockProductRepo.findById).not.toHaveBeenCalled();
    });

    it("should fetch from repository if not in cache", async () => {
      const mockProduct = productFactory.create();
      mockCacheService.get.mockResolvedValue(null);
      mockProductRepo.findById.mockResolvedValue(mockProduct);

      const result = await productService.getProductById(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `product:${mockProduct.id}`,
        mockProduct,
        3600
      );
    });

    it("should return null if product not found", async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockProductRepo.findById.mockResolvedValue(null);

      const result = await productService.getProductById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("createProduct", () => {
    it("should create a new product", async () => {
      const createInput = {
        name: "Test Product",
        slug: "test-product",
        description: "A test product",
        price: 99.99,
        sku: "TEST-001",
        stockQuantity: 100,
        categoryId: "cat-1",
      };

      const createdProduct = productFactory.create(createInput);
      mockProductRepo.create.mockResolvedValue(createdProduct);

      const result = await productService.createProduct(createInput);

      expect(result).toEqual(createdProduct);
      expect(mockProductRepo.create).toHaveBeenCalledWith(createInput);
    });

    it("should throw error if required fields are missing", async () => {
      const invalidInput = {
        name: "Test Product",
        // Missing other required fields
      };

      mockProductRepo.create.mockRejectedValue(new Error("Validation failed"));

      await expect(productService.createProduct(invalidInput as any)).rejects.toThrow(
        "Validation failed"
      );
    });
  });

  describe("getProducts", () => {
    it("should return paginated products", async () => {
      const mockProducts = productFactory.createMany(3);
      mockProductRepo.findMany.mockResolvedValue({
        data: mockProducts,
        total: 10,
        page: 1,
        limit: 3,
      });

      const result = await productService.getProducts({ page: 1, limit: 3 });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(10);
      expect(mockProductRepo.findMany).toHaveBeenCalled();
    });

    it("should apply filters correctly", async () => {
      const mockProducts = productFactory.createMany(2, { categoryId: "cat-1" });
      const filters = { categoryId: "cat-1", minPrice: 50, maxPrice: 200 };

      mockProductRepo.findMany.mockResolvedValue({
        data: mockProducts,
        total: 2,
        page: 1,
        limit: 10,
      });

      const result = await productService.getProducts(filters);

      expect(mockProductRepo.findMany).toHaveBeenCalledWith(expect.objectContaining(filters));
      expect(result.data).toHaveLength(2);
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const productId = "prod-1";
      const updateData = { name: "Updated Product", price: 149.99 };
      const updatedProduct = productFactory.create(updateData);

      mockProductRepo.update.mockResolvedValue(updatedProduct);
      mockCacheService.delete.mockResolvedValue(true);

      const result = await productService.updateProduct(productId, updateData);

      expect(result).toEqual(updatedProduct);
      expect(mockProductRepo.update).toHaveBeenCalledWith(productId, updateData);
      expect(mockCacheService.delete).toHaveBeenCalledWith(`product:${productId}`);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      const productId = "prod-1";
      mockProductRepo.delete.mockResolvedValue(true);
      mockCacheService.delete.mockResolvedValue(true);

      const result = await productService.deleteProduct(productId);

      expect(result).toBe(true);
      expect(mockProductRepo.delete).toHaveBeenCalledWith(productId);
      expect(mockCacheService.delete).toHaveBeenCalledWith(`product:${productId}`);
    });
  });

  describe("searchProducts", () => {
    it("should search products by query", async () => {
      const query = "carpet";
      const mockProducts = productFactory.createMany(2);

      mockProductRepo.search.mockResolvedValue({
        data: mockProducts,
        total: 2,
        page: 1,
        limit: 10,
      });

      const result = await productService.searchProducts(query);

      expect(result.data).toHaveLength(2);
      expect(mockProductRepo.search).toHaveBeenCalledWith(query);
    });
  });
});
