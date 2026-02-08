import { Product } from "@prisma/client";
import { ProductRepository, ProductFilters } from "../../repositories/product.repository";
import { IUploadService } from "../upload/upload.interface"; // Assuming this interface exists
import { CacheService } from "../cache/cache.service"; // Assuming this service exists
import { AppError } from "../../middleware/app-error";

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  stockQuantity: number;
  categoryId: string;
  // Add other fields as needed
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  sku?: string;
  stockQuantity?: number;
  categoryId?: string;
  // Add other fields as needed
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class ProductService {
  constructor(
    private productRepo: ProductRepository,
    private cacheService: CacheService,
    private uploadService: IUploadService
  ) {}

  async getProductById(id: string): Promise<Product | null> {
    const cachedProduct = await this.cacheService.get<Product>(`product:${id}`);
    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.productRepo.findById(id);
    if (product) {
      await this.cacheService.set(`product:${id}`, product, 3600); // Cache for 1 hour
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const cachedProduct = await this.cacheService.get<Product>(`product:${slug}`);
    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.productRepo.findBySlug(slug);
    if (!product) {
      throw new AppError(404, "Product not found", "PRODUCT_NOT_FOUND", true);
    }

    await this.cacheService.set(`product:${slug}`, product, 3600); // Cache for 1 hour
    return product;
  }

  async createProduct(data: CreateProductInput, images: File[]): Promise<Product> {
    // Upload images
    const uploadedImages = await this.uploadService.uploadMultiple(images, "products");
    // Add image URLs to product data
    // const productDataWithImages = { ...data, imageUrls: uploadedImages.map(img => img.url) };

    const product = await this.productRepo.create(data); // Use productDataWithImages
    await this.cacheService.del(`products:featured`); // Invalidate featured products cache
    return product;
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    const updatedProduct = await this.productRepo.update(id, data);
    await this.cacheService.del(`product:${updatedProduct.slug}`); // Invalidate specific product cache
    await this.cacheService.del(`products:featured`); // Invalidate featured products cache
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      return false;
    }
    const deleted = await this.productRepo.delete(id);
    if (deleted) {
      await this.cacheService.del(`product:${product.slug}`); // Invalidate specific product cache
      await this.cacheService.del(`products:featured`); // Invalidate featured products cache
      // Optionally delete images from upload service
    }
    return deleted;
  }

  async getFeaturedProducts(limit: number): Promise<Product[]> {
    const cachedFeatured = await this.cacheService.get<Product[]>(`products:featured`);
    if (cachedFeatured) {
      return cachedFeatured;
    }

    const featuredProducts = await this.productRepo.findFeatured(limit);
    await this.cacheService.set(`products:featured`, featuredProducts, 3600);
    return featuredProducts;
  }

  async searchProducts(
    query: string,
    filters: ProductFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Product>> {
    const skip = (page - 1) * limit;
    const products = await this.productRepo.searchProducts(query, filters); // Needs pagination in repo
    const total = await this.productRepo.count({
      /* appropriate filter for count */
    }); // Needs count with search filters

    return {
      data: products,
      total,
      page,
      limit,
    };
  }

  async checkAndUpdateStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.productRepo.findById(productId);
    if (!product || product.stockQuantity + quantity < 0) {
      return false; // Not enough stock or product not found
    }
    await this.productRepo.updateStock(productId, quantity);
    await this.cacheService.del(`product:${product.slug}`); // Invalidate specific product cache
    return true;
  }
}
