/**
 * Real-time Inventory Management Service
 * Manages inventory updates, stock levels, and low stock warnings
 * Supports WebSockets for real-time updates to clients
 */

import prisma from "@/lib/db/prisma";
import { EventEmitter } from "events";
import { AppError } from "@/lib/middleware/app-error";

export interface StockLevel {
  productId: string;
  sku: string | null;
  quantity: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  isLowStock: boolean;
}

export interface InventoryUpdate {
  productId: string;
  sku: string;
  quantityChange: number;
  reason: "sale" | "return" | "restock" | "adjustment" | "damage";
  timestamp: Date;
  userId?: string;
  notes?: string;
}

export interface LowStockWarning {
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  severity: "warning" | "critical";
}

/**
 * Real-time inventory service with event-driven architecture
 * Emits events for inventory changes
 */
export class RealTimeInventoryService extends EventEmitter {
  private static instance: RealTimeInventoryService;
  private updateQueue: InventoryUpdate[] = [];
  private isProcessing = false;

  private constructor() {
    super();
    this.startQueueProcessor();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RealTimeInventoryService {
    if (!RealTimeInventoryService.instance) {
      RealTimeInventoryService.instance = new RealTimeInventoryService();
    }
    return RealTimeInventoryService.instance;
  }

  /**
   * Get current stock level for a product
   */
  async getStockLevel(productId: string): Promise<StockLevel | null> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId },
      });

      if (!inventory) return null;

      const available = inventory.quantity - inventory.reserved;
      const isLowStock = available <= inventory.reorderLevel;

      return {
        productId,
        sku: inventory.sku,
        quantity: inventory.quantity,
        reserved: inventory.reserved,
        available,
        reorderLevel: inventory.reorderLevel,
        isLowStock,
      };
    } catch (error) {
      console.error("Error getting stock level:", error);
      throw error;
    }
  }

  /**
   * Get stock levels for multiple products
   */
  async getStockLevels(productIds: string[]): Promise<StockLevel[]> {
    try {
      const inventories = await prisma.inventory.findMany({
        where: { productId: { in: productIds } },
      });

      return inventories.map((inv) => ({
        productId: inv.productId,
        sku: inv.sku,
        quantity: inv.quantity,
        reserved: inv.reserved,
        available: inv.quantity - inv.reserved,
        reorderLevel: inv.reorderLevel,
        isLowStock: inv.quantity - inv.reserved <= inv.reorderLevel,
      }));
    } catch (error) {
      console.error("Error getting stock levels:", error);
      throw error;
    }
  }

  /**
   * Update inventory quantity
   */
  async updateInventory(
    productId: string,
    quantityChange: number,
    reason: InventoryUpdate["reason"],
    userId?: string,
    notes?: string
  ): Promise<StockLevel> {
    try {
      // Add to queue for processing
      this.updateQueue.push({
        productId,
        quantityChange,
        reason,
        timestamp: new Date(),
        userId,
        notes,
        sku: "", // Will be filled from DB
      });

      // Process queue asynchronously
      this.processQueue();

      // Get updated stock level
      const updated = await this.getStockLevel(productId);
      if (!updated) throw new AppError(404, "Product not found", "PRODUCT_NOT_FOUND", true);

      // Emit inventory change event
      this.emit("inventory-updated", { ...updated });

      // Check for low stock
      if (updated.isLowStock) {
        this.emit("low-stock-warning", {
          productId: updated.productId,
          currentStock: updated.available,
          reorderLevel: updated.reorderLevel,
          severity: updated.available === 0 ? "critical" : "warning",
        } as LowStockWarning);
      }

      return updated;
    } catch (error) {
      console.error("Error updating inventory:", error);
      throw error;
    }
  }

  /**
   * Reserve inventory during checkout
   */
  async reserveInventory(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const stock = await this.getStockLevel(productId);
      if (!stock || stock.available < quantity) {
        return false;
      }

      // Update reserved quantity
      await prisma.inventory.update({
        where: { productId },
        data: {
          reserved: { increment: quantity },
        },
      });

      // Record reservation
      await prisma.inventoryReservation.create({
        data: {
          productId,
          quantity,
          orderId,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
      });

      this.emit("inventory-reserved", { productId, quantity, orderId });
      return true;
    } catch (error) {
      console.error("Error reserving inventory:", error);
      throw error;
    }
  }

  /**
   * Release reserved inventory
   */
  async releaseReservation(reservationId: string): Promise<void> {
    try {
      const reservation = await prisma.inventoryReservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) return;

      // Release the quantity
      await prisma.inventory.update({
        where: { productId: reservation.productId },
        data: {
          reserved: { decrement: reservation.quantity },
        },
      });

      // Delete reservation
      await prisma.inventoryReservation.delete({
        where: { id: reservationId },
      });

      this.emit("inventory-released", {
        productId: reservation.productId,
        quantity: reservation.quantity,
      });
    } catch (error) {
      console.error("Error releasing reservation:", error);
      throw error;
    }
  }

  /**
   * Confirm inventory (convert reservation to sale)
   */
  async confirmInventory(orderId: string): Promise<void> {
    try {
      const reservations = await prisma.inventoryReservation.findMany({
        where: { orderId },
      });

      for (const reservation of reservations) {
        // Deduct from quantity (already accounted in reserved)
        await prisma.inventory.update({
          where: { productId: reservation.productId },
          data: {
            quantity: { decrement: reservation.quantity },
            reserved: { decrement: reservation.quantity },
          },
        });

        // Log the sale
        await this.updateInventory(
          reservation.productId,
          -reservation.quantity,
          "sale",
          undefined,
          `Order ${orderId}`
        );

        // Delete reservation
        await prisma.inventoryReservation.delete({
          where: { id: reservation.id },
        });
      }

      this.emit("inventory-confirmed", { orderId });
    } catch (error) {
      console.error("Error confirming inventory:", error);
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold: number = 10): Promise<LowStockWarning[]> {
    try {
      const inventories = await prisma.inventory.findMany({
        where: {
          quantity: { lte: threshold },
        },
        include: {
          product: {
            select: { name: true },
          },
        },
      });

      return inventories.map((inv) => ({
        productId: inv.productId,
        productName: inv.product.name,
        currentStock: inv.quantity,
        reorderLevel: inv.reorderLevel,
        severity: inv.quantity === 0 ? "critical" : "warning",
      }));
    } catch (error) {
      console.error("Error getting low stock products:", error);
      throw error;
    }
  }

  /**
   * Get inventory history for a product
   */
  async getInventoryHistory(productId: string, limit: number = 50) {
    try {
      return await prisma.inventoryLog.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (error) {
      console.error("Error getting inventory history:", error);
      throw error;
    }
  }

  /**
   * Process pending inventory updates
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.updateQueue.length === 0) return;

    this.isProcessing = true;

    let batch: InventoryUpdate[] = []; // Declare batch here

    try {
      batch = this.updateQueue.splice(0, 50); // Process 50 at a time

      for (const update of batch) {
        const product = await prisma.product.findUnique({
          where: { id: update.productId },
          select: { id: true, sku: true },
        });

        if (product) {
          update.sku = product.sku || "";

          // Update inventory
          const updatedInventory = await prisma.inventory.update({
            where: { productId: update.productId },
            data: {
              quantity: { increment: update.quantityChange },
            },
          });

          // Log the update
          await prisma.inventoryLog.create({
            data: {
              productId: update.productId,
              quantityChange: update.quantityChange,
              newQuantity: updatedInventory.quantity,
              reason: update.reason,
              userId: update.userId,
              notes: update.notes,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error processing inventory queue:", error);
      // Re-add failed updates to queue
      this.updateQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;

      // Continue processing if queue not empty
      if (this.updateQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  /**
   * Start queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.updateQueue.length > 0) {
        this.processQueue();
      }
    }, 5000);
  }

  /**
   * Export inventory status for analytics
   */
  async getInventoryMetrics() {
    try {
      const inventories = await prisma.inventory.findMany();

      return {
        totalProducts: inventories.length,
        totalQuantity: inventories.reduce((sum, inv) => sum + inv.quantity, 0),
        totalReserved: inventories.reduce((sum, inv) => sum + inv.reserved, 0),
        lowStockCount: inventories.filter((inv) => inv.quantity <= inv.reorderLevel).length,
        outOfStockCount: inventories.filter((inv) => inv.quantity === 0).length,
        averageStockLevel:
          inventories.reduce((sum, inv) => sum + inv.quantity, 0) / inventories.length,
      };
    } catch (error) {
      console.error("Error getting inventory metrics:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const realTimeInventoryService = RealTimeInventoryService.getInstance();
