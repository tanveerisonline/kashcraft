/**
 * Product Waitlist Service
 * Manages out-of-stock notifications and waitlist functionality
 */

import prisma from "@/lib/db/prisma";
import { EventEmitter } from "events";

export interface WaitlistEntry {
  id: string;
  userId: string;
  productId: string;
  email: string;
  createdAt: Date;
  notifiedAt?: Date;
  status: "active" | "notified" | "purchased" | "cancelled";
}

export interface WaitlistStats {
  totalWaitlisted: number;
  notifyable: number;
  notified: number;
  averageWaitTime: number;
}

/**
 * Product waitlist service with notifications
 */
export class ProductWaitlistService extends EventEmitter {
  private static instance: ProductWaitlistService;

  private constructor() {
    super();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProductWaitlistService {
    if (!ProductWaitlistService.instance) {
      ProductWaitlistService.instance = new ProductWaitlistService();
    }
    return ProductWaitlistService.instance;
  }

  /**
   * Add user to waitlist
   */
  async addToWaitlist(userId: string, productId: string, email: string): Promise<WaitlistEntry> {
    try {
      // Check if already on waitlist
      const existing = await prisma.waitlist.findFirst({
        where: { userId, productId, status: "active" },
      });

      if (existing) {
        return this.mapWaitlistEntry(existing);
      }

      const waitlistEntry = await prisma.waitlist.create({
        data: {
          userId,
          productId,
          email,
          status: "active",
        },
      });

      this.emit("user-added-to-waitlist", {
        userId,
        productId,
        email,
      });

      return this.mapWaitlistEntry(waitlistEntry);
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      throw error;
    }
  }

  /**
   * Remove user from waitlist
   */
  async removeFromWaitlist(userId: string, productId: string): Promise<boolean> {
    try {
      const result = await prisma.waitlist.updateMany({
        where: { userId, productId },
        data: { status: "cancelled" },
      });

      if (result.count > 0) {
        this.emit("user-removed-from-waitlist", { userId, productId });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error removing from waitlist:", error);
      return false;
    }
  }

  /**
   * Get user's waitlist
   */
  async getUserWaitlist(userId: string): Promise<WaitlistEntry[]> {
    try {
      const entries = await prisma.waitlist.findMany({
        where: { userId, status: "active" },
        orderBy: { createdAt: "desc" },
      });

      return entries.map((e) => this.mapWaitlistEntry(e));
    } catch (error) {
      console.error("Error getting user waitlist:", error);
      return [];
    }
  }

  /**
   * Get waitlist for a product
   */
  async getProductWaitlist(productId: string): Promise<WaitlistEntry[]> {
    try {
      const entries = await prisma.waitlist.findMany({
        where: { productId, status: "active" },
        orderBy: { createdAt: "asc" },
      });

      return entries.map((e) => this.mapWaitlistEntry(e));
    } catch (error) {
      console.error("Error getting product waitlist:", error);
      return [];
    }
  }

  /**
   * Notify waitlist when product is back in stock
   */
  async notifyWaitlist(productId: string): Promise<number> {
    try {
      const waitlistEntries = await prisma.waitlist.findMany({
        where: { productId, status: "active" },
        orderBy: { createdAt: "asc" },
      });

      let notifiedCount = 0;

      for (const entry of waitlistEntries) {
        try {
          // Update entry
          await prisma.waitlist.update({
            where: { id: entry.id },
            data: { status: "notified", notifiedAt: new Date() },
          });

          // Emit notification event (handled by email service)
          this.emit("waitlist-notify", {
            userId: entry.userId,
            productId,
            email: entry.email,
          });

          notifiedCount++;
        } catch (error) {
          console.error(`Error notifying waitlist entry ${entry.id}:`, error);
        }
      }



      return notifiedCount;
    } catch (error) {
      console.error("Error notifying waitlist:", error);
      return 0;
    }
  }

  /**
   * Check if user is on waitlist for product
   */
  async isOnWaitlist(userId: string, productId: string): Promise<boolean> {
    try {
      const entry = await prisma.waitlist.findFirst({
        where: { userId, productId, status: "active" },
      });

      return !!entry;
    } catch (error) {
      console.error("Error checking waitlist:", error);
      return false;
    }
  }

  /**
   * Get waitlist position
   */
  async getWaitlistPosition(userId: string, productId: string): Promise<number | null> {
    try {
      const position = await prisma.waitlist.count({
        where: {
          productId,
          status: "active",
          createdAt: {
            lte: new Date(), // Entries created before current user
          },
        },
      });

      // Check if user is on waitlist
      const isOnList = await this.isOnWaitlist(userId, productId);
      return isOnList ? position + 1 : null;
    } catch (error) {
      console.error("Error getting waitlist position:", error);
      return null;
    }
  }

  /**
   * Mark entries as purchased
   */
  async markAsPurchased(productId: string, userId: string): Promise<boolean> {
    try {
      const result = await prisma.waitlist.updateMany({
        where: { productId, userId, status: { in: ["active", "notified"] } },
        data: { status: "purchased" },
      });

      if (result.count > 0) {
        this.emit("waitlist-purchased", { userId, productId });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error marking as purchased:", error);
      return false;
    }
  }

  /**
   * Clean up old notified entries (older than 30 days)
   */
  async cleanupOldEntries(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await prisma.waitlist.deleteMany({
        where: {
          status: "notified",
          notifiedAt: { lt: thirtyDaysAgo },
        },
      });

      return result.count;
    } catch (error) {
      console.error("Error cleaning up old entries:", error);
      return 0;
    }
  }

  /**
   * Get waitlist statistics for a product
   */
  async getWaitlistStats(productId: string): Promise<WaitlistStats> {
    try {
      const totalWaitlisted = await prisma.waitlist.count({
        where: { productId },
      });

      const active = await prisma.waitlist.count({
        where: { productId, status: "active" },
      });

      const notified = await prisma.waitlist.count({
        where: { productId, status: "notified" },
      });

      // Calculate average wait time for notified entries
      const notifiedEntries = await prisma.waitlist.findMany({
        where: { productId, status: "notified", notifiedAt: { not: null } },
        select: { createdAt: true, notifiedAt: true },
      });

      let averageWaitTime = 0;
      if (notifiedEntries.length > 0) {
        const totalWaitTime = notifiedEntries.reduce((sum, entry) => {
          const waitTime =
            (entry.notifiedAt!.getTime() - entry.createdAt.getTime()) / (1000 * 60 * 60); // in hours
          return sum + waitTime;
        }, 0);
        averageWaitTime = Math.round(totalWaitTime / notifiedEntries.length);
      }

      return {
        totalWaitlisted,
        notifyable: active,
        notified,
        averageWaitTime,
      };
    } catch (error) {
      console.error("Error getting waitlist stats:", error);
      return {
        totalWaitlisted: 0,
        notifyable: 0,
        notified: 0,
        averageWaitTime: 0,
      };
    }
  }

  /**
   * Get global waitlist stats
   */
  async getGlobalWaitlistStats(): Promise<any> {
    try {
      const totalEntries = await prisma.waitlist.count();
      const activeEntries = await prisma.waitlist.count({
        where: { status: "active" },
      });
      const notifiedEntries = await prisma.waitlist.count({
        where: { status: "notified" },
      });

      // Most waitlisted products
      const mostWaitlisted = await prisma.waitlist.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      });

      return {
        totalEntries,
        activeEntries,
        notifiedEntries,
        conversionRate:
          totalEntries > 0 ? ((notifiedEntries / totalEntries) * 100).toFixed(2) : "0",
        mostWaitlisted: mostWaitlisted.map((item) => ({
          productId: item.productId,
          count: item._count.productId,
        })),
      };
    } catch (error) {
      console.error("Error getting global waitlist stats:", error);
      throw error;
    }
  }

  /**
   * Export waitlist to CSV
   */
  async exportWaitlistCSV(productId: string): Promise<string> {
    try {
      const entries = await this.getProductWaitlist(productId);

      const headers = ["Email", "User ID", "Joined Date", "Status", "Notified Date"];
      const rows = entries.map((entry) =>
        [
          entry.email,
          entry.userId,
          entry.createdAt.toISOString(),
          entry.status,
          entry.notifiedAt?.toISOString() || "",
        ].join(",")
      );

      return [headers.join(","), ...rows].join("\n");
    } catch (error) {
      console.error("Error exporting waitlist:", error);
      throw error;
    }
  }

  /**
   * Map database entry to interface
   */
  private mapWaitlistEntry(entry: any): WaitlistEntry {
    return {
      id: entry.id,
      userId: entry.userId,
      productId: entry.productId,
      email: entry.email,
      createdAt: entry.createdAt,
      notifiedAt: entry.notifiedAt || undefined,
      status: entry.status,
    };
  }
}

// Export singleton instance
export const productWaitlistService = ProductWaitlistService.getInstance();
