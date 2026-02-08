// src/lib/services/discount/discount.service.ts

import { PrismaClient, DiscountType } from "@prisma/client";
import { AppError } from "../../middleware/app-error";

// Placeholder interfaces
export interface CouponValidation {
  isValid: boolean;
  message: string;
  discountAmount?: number;
  discountPercentage?: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number;
  usageLimit: number | null;
  timesUsed: number;
  expirationDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  expirationDate?: Date;
}

export class DiscountService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async validateCoupon(code: string, cartTotal: number): Promise<CouponValidation> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return { isValid: false, message: "Coupon not found." };
    }
    if (!coupon.isActive) {
      return { isValid: false, message: "Coupon is not active." };
    }
    if (coupon.expirationDate && coupon.expirationDate < new Date()) {
      return { isValid: false, message: "Coupon has expired." };
    }
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return { isValid: false, message: "Coupon usage limit reached." };
    }
    if (coupon.minimumOrderAmount && cartTotal < coupon.minimumOrderAmount.toNumber()) {
      return {
        isValid: false,
        message: `Minimum order amount of ${coupon.minimumOrderAmount} not met.`,
      };
    }

    let discountAmount = 0;
    let discountPercentage = 0;

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountPercentage = coupon.discountValue.toNumber();
      discountAmount = cartTotal * (coupon.discountValue.toNumber() / 100);
    } else {
      discountAmount = coupon.discountValue.toNumber();
    }

    return {
      isValid: true,
      message: "Coupon is valid.",
      discountAmount,
      discountPercentage,
    };
  }

  async applyCoupon(code: string, orderId: string): Promise<Coupon> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new AppError(404, "Coupon not found.", "COUPON_NOT_FOUND", true);
    }
    if (!coupon.isActive) {
      throw new AppError(400, "Coupon is not active.", "COUPON_INACTIVE", true);
    }
    if (coupon.expirationDate && coupon.expirationDate < new Date()) {
      throw new AppError(400, "Coupon has expired.", "COUPON_EXPIRED", true);
    }
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      throw new AppError(400, "Coupon usage limit reached.", "COUPON_LIMIT_REACHED", true);
    }

    // Assuming order total validation happens before calling applyCoupon
    // For simplicity, we'll just apply the discount value directly here.
    // In a real scenario, you'd fetch the order, calculate the discount based on its total,
    // and then update the order's total and apply the discount record.

    let discountValue = coupon.discountValue;
    // If percentage, calculate actual amount based on order total (not implemented here for brevity)
    // if (coupon.discountType === DiscountType.PERCENTAGE) {
    //   const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    //   if (order) {
    //     discountValue = order.total * (coupon.discountValue / 100);
    //   }
    // }

    const discount = await this.prisma.coupon.create({
      data: {
        code: coupon.code,
        discountValue: discountValue,
        discountType: coupon.discountType,
        minimumOrderAmount: coupon.minimumOrderAmount,
        usageLimit: coupon.usageLimit,
        expirationDate: coupon.expirationDate,
        isActive: coupon.isActive,
      },
    });

    await this.prisma.coupon.update({
      where: { id: coupon.id },
      data: { timesUsed: { increment: 1 } },
    });

    return {
      ...discount,
      discountValue: discount.discountValue.toNumber(),
      minimumOrderAmount: discount.minimumOrderAmount?.toNumber(),
    };
  }

  async createCoupon(data: CreateCouponInput): Promise<Coupon> {
    const newCoupon = await this.prisma.coupon.create({
      data: {
        ...data,
        timesUsed: 0,
        isActive: true,
      },
    });
    return {
      ...newCoupon,
      discountValue: newCoupon.discountValue.toNumber(),
      minimumOrderAmount: newCoupon.minimumOrderAmount?.toNumber(),
    };
  }

  async getActiveCoupons(): Promise<Coupon[]> {
    const activeCoupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ expirationDate: { gte: new Date() } }, { expirationDate: null }],
      },
    });
    return activeCoupons.map((coupon) => ({
      ...coupon,
      discountValue: coupon.discountValue.toNumber(),
      minimumOrderAmount: coupon.minimumOrderAmount?.toNumber(),
    }));
  }

  async deactivateCoupon(code: string): Promise<boolean> {
    const updatedCoupon = await this.prisma.coupon.update({
      where: { code },
      data: { isActive: false },
    });
    return updatedCoupon.isActive === false;
  }
}
