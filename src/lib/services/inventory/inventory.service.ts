// src/lib/services/inventory/inventory.service.ts

import { PrismaClient, Product } from "@prisma/client";
import { AppError } from "../../middleware/app-error";

// Placeholder interface for StockMovement
export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  reason: string | null;
  createdAt: Date;
}

export class InventoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    // In a real application, this would involve a transaction to decrement stock
    // and create a reservation record.
    try {
      await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product || product.stockQuantity < quantity) {
          throw new AppError(
            400,
            "Insufficient stock or product not found.",
            "INSUFFICIENT_STOCK",
            true
          );
        }

        await tx.product.update({
          where: { id: productId },
          data: { stockQuantity: { decrement: quantity } },
        });

        // Log stock movement
        await tx.stockMovement.create({
          data: {
            productId,
            quantity,
            type: "OUT",
            reason: "Stock Reserved",
          },
        });
      });
      return true;
    } catch (error) {
      console.error(`Failed to reserve stock for product ${productId}:`, error);
      return false;
    }
  }

  async releaseStock(productId: string, quantity: number): Promise<boolean> {
    // This would typically be called if an order is cancelled or a reservation expires.
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: productId },
          data: { stockQuantity: { increment: quantity } },
        });

        // Log stock movement
        await tx.stockMovement.create({
          data: {
            productId,
            quantity,
            type: "IN",
            reason: "Stock Released",
          },
        });
      });
      return true;
    } catch (error) {
      console.error(`Failed to release stock for product ${productId}:`, error);
      return false;
    }
  }

  async updateStock(productId: string, quantity: number, reason: string): Promise<boolean> {
    // This method can be used for general stock adjustments (e.g., receiving new inventory, damages).
    try {
      await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new AppError(404, "Product not found.", "PRODUCT_NOT_FOUND", true);
        }

        const currentStock = product.stockQuantity;
        const newStock = quantity; // Assuming 'quantity' here is the absolute new stock level

        await tx.product.update({
          where: { id: productId },
          data: { stockQuantity: newStock },
        });

        // Log stock movement
        await tx.stockMovement.create({
          data: {
            productId,
            quantity: newStock - currentStock, // Log the change in quantity
            type: "ADJUSTMENT",
            reason,
          },
        });
      });
      return true;
    } catch (error) {
      console.error(`Failed to update stock for product ${productId}:`, error);
      return false;
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    // Retrieves products whose stock quantity falls below a certain threshold.
    try {
      const lowStockProducts = await this.prisma.product.findMany({
        where: {
          stockQuantity: {
            lte: threshold,
          },
        },
      });
      return lowStockProducts;
    } catch (error) {
      console.error("Failed to retrieve low stock products:", error);
      return [];
    }
  }

  async getStockHistory(productId: string): Promise<StockMovement[]> {
    // Retrieves the history of stock movements for a specific product.
    try {
      const stockHistory = await this.prisma.stockMovement.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
      });
      return stockHistory;
    } catch (error) {
      console.error(`Failed to retrieve stock history for product ${productId}:`, error);
      return [];
    }
  }
}
