/**
 * Gift Cards and Vouchers Management Service
 * Handles gift card creation, redemption, and balance management
 */

import prisma from "@/lib/db/prisma";
import crypto from "crypto";

import { Prisma } from '@prisma/client';

export type GiftCardStatus = "active" | "used" | "expired" | "cancelled";

export interface GiftCard {
  id: string;
  code: string;
  initialValue: Prisma.Decimal;
  currentBalance: Prisma.Decimal;
  status: GiftCardStatus;
  expiresAt: Date;
  createdAt: Date;
  firstUsedAt?: Date;
  purchasedBy?: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  discountValue: Prisma.Decimal;
  maxUsages: number | null;
  currentUsages: number;
  expiresAt: Date;
  startDate: Date;
  minOrderValue?: Prisma.Decimal;
  maxDiscount?: Prisma.Decimal;
  createdAt: Date;
}

/**
 * Gift cards and vouchers service
 */
export class GiftCardVoucherService {
  private static instance: GiftCardVoucherService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): GiftCardVoucherService {
    if (!GiftCardVoucherService.instance) {
      GiftCardVoucherService.instance = new GiftCardVoucherService();
    }
    return GiftCardVoucherService.instance;
  }

  /**
   * Create gift card
   */
  async createGiftCard(amount: number, expiryDays: number = 365): Promise<GiftCard> {
    try {
      const code = this.generateGiftCardCode();
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

      const giftCard = await prisma.giftCard.create({
        data: {
          code,
          initialValue: amount,
          currentBalance: amount,
          status: "active",
          expiresAt,
        },
      });

      return {
        id: giftCard.id,
        code: giftCard.code,
        currentBalance: giftCard.currentBalance,
        initialValue: giftCard.initialValue,
        status: giftCard.status as GiftCardStatus,
        expiresAt: giftCard.expiresAt,
        createdAt: giftCard.createdAt,
      };
    } catch (error) {
      console.error("Error creating gift card:", error);
      throw error;
    }
  }

  /**
   * Bulk create gift cards
   */
  async bulkCreateGiftCards(
    quantity: number,
    amount: Prisma.Decimal,
    expiryDays: number = 365
  ): Promise<GiftCard[]> {
    try {
      const giftCards: GiftCard[] = [];
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

      for (let i = 0; i < quantity; i++) {
        const code = this.generateGiftCardCode();

        const giftCard = await prisma.giftCard.create({
          data: {
            code,
            currentBalance: new Prisma.Decimal(amount),
            initialValue: new Prisma.Decimal(amount),
            status: "active",
            expiresAt,
          },
        });

        giftCards.push({
          id: giftCard.id,
          code: giftCard.code,
          currentBalance: giftCard.currentBalance,
          initialValue: giftCard.initialValue,
          status: giftCard.status as GiftCardStatus,
          expiresAt: giftCard.expiresAt,
          createdAt: giftCard.createdAt,
        });
      }

      return giftCards;
    } catch (error) {
      console.error("Error bulk creating gift cards:", error);
      throw error;
    }
  }

  /**
   * Get gift card by code
   */
  async getGiftCard(code: string): Promise<GiftCard | null> {
    try {
      const giftCard = await prisma.giftCard.findUnique({
        where: { code },
      });

      if (!giftCard) return null;

      return {
        id: giftCard.id,
        code: giftCard.code,
        currentBalance: giftCard.currentBalance,
        initialValue: giftCard.initialValue,
        status: giftCard.status as GiftCardStatus,
        expiresAt: giftCard.expiresAt,
        createdAt: giftCard.createdAt,
        firstUsedAt: giftCard.firstUsedAt || undefined,
        purchasedBy: giftCard.purchasedBy || undefined,
      };
    } catch (error) {
      console.error("Error getting gift card:", error);
      throw error;
    }
  }

  /**
   * Check if gift card is valid
   */
  async validateGiftCard(
    code: string
  ): Promise<{ valid: boolean; message: string; currentBalance?: Prisma.Decimal }> {
    try {
      const giftCard = await this.getGiftCard(code);

      if (!giftCard) {
        return { valid: false, message: "Gift card not found" };
      }

      if (giftCard.status === "expired") {
        return { valid: false, message: "Gift card has expired" };
      }

      if (giftCard.status === "used") {
        return { valid: false, message: "Gift card has already been used" };
      }

      if (giftCard.status === "cancelled") {
        return { valid: false, message: "Gift card has been cancelled" };
      }

      if (new Date() > giftCard.expiresAt) {
        // Auto-expire gift card
        await prisma.giftCard.update({
          where: { code },
          data: { status: "expired" },
        });
        return { valid: false, message: "Gift card has expired" };
      }

      return { valid: true, message: "Gift card is valid", currentBalance: giftCard.currentBalance };
    } catch (error) {
      console.error("Error validating gift card:", error);
      return { valid: false, message: "Error validating gift card" };
    }
  }

  /**
   * Redeem gift card
   */
  async redeemGiftCard(
    code: string,
    orderId: string,
    userId: string,
    amount: number
  ): Promise<{ success: boolean; newBalance?: Prisma.Decimal; message: string }> {
    try {
      const giftCard = await this.getGiftCard(code);

      if (!giftCard) {
        return { success: false, message: "Gift card not found" };
      }

      if (giftCard.currentBalance.lessThan(amount)) {
        return {
          success: false,
          message: `Insufficient balance. Available: $${giftCard.currentBalance}`,
        };
      }

      const newBalance = giftCard.currentBalance.minus(amount);

      // Update gift card
      await prisma.giftCard.update({
        where: { code },
        data: {
          currentBalance: newBalance,
          status: newBalance.equals(new Prisma.Decimal(0)) ? "used" : "active",
          firstUsedAt: newBalance.equals(new Prisma.Decimal(0)) ? new Date() : undefined,
        },
      });

      // Record usage
      await prisma.giftCardUsage.create({
        data: {
          giftCardId: giftCard.id,
          orderId,
          userId,
          amountUsed: amount,
        },
      });

      return {
        success: true,
        newBalance,
        message: `$${amount} redeemed successfully`,
      };
    } catch (error) {
      console.error("Error redeeming gift card:", error);
      return { success: false, message: "Error redeeming gift card" };
    }
  }

  /**
   * Check gift card balance
   */
  async checkBalance(code: string): Promise<Prisma.Decimal | null> {
    try {
      const giftCard = await this.getGiftCard(code);
      return giftCard?.currentBalance || null;
    } catch (error) {
      console.error("Error checking balance:", error);
      return null;
    }
  }

  /**
   * Cancel gift card
   */
  async cancelGiftCard(code: string, reason?: string): Promise<boolean> {
    try {
      await prisma.giftCard.update({
        where: { code },
        data: {
          status: "cancelled",
          notes: reason,
        },
      });

      return true;
    } catch (error) {
      console.error("Error cancelling gift card:", error);
      return false;
    }
  }

  // Voucher methods

  /**
   * Create voucher/coupon code
   */
  async createVoucher(
    name: string,
    discountType: "percentage" | "fixed",
    discountValue: Prisma.Decimal,
    maxUsages: number,
    expiryDays: number,
    startDate: Date = new Date(),
    minOrderValue?: Prisma.Decimal,
    maxDiscount?: Prisma.Decimal
  ): Promise<Voucher> {
    try {
      const code = this.generateVoucherCode();
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

      const voucher = await prisma.voucher.create({
        data: {
          code,
          name,
          discountType,
          discountValue: new Prisma.Decimal(discountValue),
          maxUsages,
          expiresAt,
          startDate,
          minOrderValue: minOrderValue ? new Prisma.Decimal(minOrderValue) : undefined,
          maxDiscount: maxDiscount ? new Prisma.Decimal(maxDiscount) : undefined,
        },
      });

      return {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        discountType: voucher.discountType as "percentage" | "fixed",
        discountValue: voucher.discountValue,
        maxUsages: voucher.maxUsages || 0,
        currentUsages: 0,
        expiresAt: voucher.expiresAt,
        startDate: voucher.startDate,
        minOrderValue: voucher.minOrderValue || undefined,
        maxDiscount: voucher.maxDiscount || undefined,
        createdAt: voucher.createdAt,
      };
    } catch (error) {
      console.error("Error creating voucher:", error);
      throw error;
    }
  }

  /**
   * Validate voucher
   */
  async validateVoucher(
    code: string,
    orderValue: Prisma.Decimal
  ): Promise<{ valid: boolean; discount?: Prisma.Decimal; message: string }> {
    try {
      const voucher = await prisma.voucher.findUnique({
        where: { code },
      });

      if (!voucher) {
        return { valid: false, message: "Voucher code not found" };
      }

      if (voucher.maxUsages !== null && voucher.currentUsages >= voucher.maxUsages) {
        return { valid: false, message: "Voucher has reached maximum usages" };
      }

      if (new Date() > voucher.expiresAt) {
        return { valid: false, message: "Voucher has expired" };
      }

      if (voucher.minOrderValue && orderValue.lessThan(voucher.minOrderValue)) {
        return {
          valid: false,
          message: `Minimum order value is $${voucher.minOrderValue}`,
        };
      }

      // Calculate discount
      let discount = new Prisma.Decimal(0);
      if (voucher.discountType === "percentage") {
        discount = orderValue.times(voucher.discountValue).dividedBy(100);
        if (voucher.maxDiscount && discount.greaterThan(voucher.maxDiscount)) {
          discount = voucher.maxDiscount;
        }
      } else {
        discount = voucher.discountValue;
      }

      return {
        valid: true,
        discount,
        message: "Voucher is valid",
      };
    } catch (error) {
      console.error("Error validating voucher:", error);
      return { valid: false, message: "Error validating voucher" };
    }
  }

  /**
   * Apply voucher to order
   */
  async applyVoucher(code: string, orderId: string, discount: Prisma.Decimal): Promise<boolean> {
    try {
      const voucher = await prisma.voucher.findUnique({
        where: { code },
      });

      if (!voucher) return false;

      // Increment usage count
      await prisma.voucher.update({
        where: { code },
        data: { currentUsages: { increment: 1 } },
      });

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { total: true },
      });

      if (!order) {
        console.error(`Order with ID ${orderId} not found.`);
        return false;
      }

      const orderTotal = order.total;
      const finalTotal = orderTotal.minus(discount);

      // Record usage
      await prisma.voucherUsage.create({
        data: {
          voucherId: voucher.id,
          orderId,
          discountAmount: discount,
          orderTotal: orderTotal,
          finalTotal: finalTotal,
        },
      });

      return true;
    } catch (error) {
      console.error("Error applying voucher:", error);
      return false;
    }
  }

  /**
   * Get voucher statistics
   */
  async getVoucherStats(code: string): Promise<any> {
    try {
      const voucher = await prisma.voucher.findUnique({
        where: { code },
        include: {
          usage: true,
        },
      });

      if (!voucher) return null;

      return {
        code: voucher.code,
        maxUsages: voucher.maxUsages,
        usageCount: voucher.currentUsages,
        usagePercentage: voucher.maxUsages ? ((voucher.currentUsages / voucher.maxUsages) * 100).toFixed(2) : "N/A",
        totalDiscount: voucher.usage.reduce((sum, u) => sum.plus(u.discountAmount), new Prisma.Decimal(0)),
        expiresAt: voucher.expiresAt,
        daysUntilExpiry: Math.ceil(
          (voucher.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      };
    } catch (error) {
      console.error("Error getting voucher stats:", error);
      throw error;
    }
  }

  /**
   * Generate unique gift card code
   */
  private generateGiftCardCode(): string {
    // Format: GC-XXXX-XXXX-XXXX-XXXX (20 characters)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "GC-";

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 3) code += "-";
    }

    return code;
  }

  /**
   * Generate unique voucher code
   */
  private generateVoucherCode(): string {
    // Format: VC-XXXXXX (9 characters)
    return "VC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  }
}

// Export singleton instance
export const giftCardVoucherService = GiftCardVoucherService.getInstance();
