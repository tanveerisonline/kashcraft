import { PrismaClient, Product } from "@prisma/client";
import { BaseRepository, QueryOptions } from "./base.repository";

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  // Add other product-specific filters as needed
}

export class ProductRepository extends BaseRepository<Product> {
  constructor(prisma: PrismaClient) {
    super(prisma, "Product");
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.model.findUnique({ where: { slug } });
  }

  async findFeatured(limit: number): Promise<Product[]> {
    return this.model.findMany({
      where: { isFeatured: true },
      take: limit,
    });
  }

  async findByCategory(categoryId: string, options?: QueryOptions): Promise<Product[]> {
    return this.model.findMany({
      where: { categoryId },
      ...options,
    });
  }

  async updateStock(productId: string, quantity: number): Promise<Product> {
    return this.model.update({
      where: { id: productId },
      data: { stockQuantity: { increment: quantity } },
    });
  }

  async checkLowStock(): Promise<Product[]> {
    // Assuming 'low stock' is defined as less than 10 units
    return this.model.findMany({
      where: { stockQuantity: { lt: 10 } },
    });
  }

  async searchProducts(query: string, filters: ProductFilters): Promise<Product[]> {
    const { categoryId, minPrice, maxPrice } = filters;
    return this.model.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        ...(categoryId && { categoryId }),
        ...(minPrice && { price: { gte: minPrice } }),
        ...(maxPrice && { price: { lte: maxPrice } }),
      },
    });
  }
}
