import { describe, it, expect, beforeEach, vi } from "@jest/globals";
import { DiscountService } from "@/lib/services/discount/discount.service";
import { AppError } from "@/lib/middleware/app-error";

describe("DiscountService Integration Tests", () => {
  let discountService: DiscountService;

  beforeEach(() => {
    discountService = new DiscountService();
    vi.clearAllMocks();
  });

  describe("validateCoupon", () => {
    it("should return valid coupon with correct discount", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "SAVE10",
        isActive: true,
        discountType: "PERCENTAGE",
        discountValue: 10,
        expirationDate: new Date(Date.now() + 1000000),
        usageLimit: 100,
        timesUsed: 5,
      };

      // Mock Prisma findUnique
      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);

      const result = await discountService.validateCoupon("SAVE10", 100);

      expect(result.isValid).toBe(true);
      expect(result.discountPercentage).toBe(10);
      expect(result.discountAmount).toBe(10); // 100 * 10%
    });

    it("should return invalid for expired coupon", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "EXPIRED",
        isActive: true,
        discountType: "PERCENTAGE",
        discountValue: 10,
        expirationDate: new Date(Date.now() - 1000000), // Past date
        usageLimit: 100,
        timesUsed: 5,
      };

      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);

      const result = await discountService.validateCoupon("EXPIRED", 100);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("expired");
    });

    it("should return invalid for inactive coupon", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "INACTIVE",
        isActive: false,
        discountType: "PERCENTAGE",
        discountValue: 10,
      };

      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);

      const result = await discountService.validateCoupon("INACTIVE", 100);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("not active");
    });

    it("should return invalid if usage limit reached", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "LIMITED",
        isActive: true,
        discountType: "PERCENTAGE",
        discountValue: 10,
        expirationDate: new Date(Date.now() + 1000000),
        usageLimit: 5,
        timesUsed: 5,
      };

      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);

      const result = await discountService.validateCoupon("LIMITED", 100);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("limit");
    });

    it("should return invalid if minimum order amount not met", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "MINORDER",
        isActive: true,
        discountType: "PERCENTAGE",
        discountValue: 10,
        minimumOrderAmount: 100,
        expirationDate: new Date(Date.now() + 1000000),
      };

      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);

      const result = await discountService.validateCoupon("MINORDER", 50); // Below minimum

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("Minimum order");
    });

    it("should handle non-existent coupon", async () => {
      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(null);

      const result = await discountService.validateCoupon("NOTFOUND", 100);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("not found");
    });
  });

  describe("applyCoupon", () => {
    it("should apply valid coupon and increment usage", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "SAVE10",
        isActive: true,
        discountType: "PERCENTAGE",
        discountValue: 10,
        expirationDate: new Date(Date.now() + 1000000),
        usageLimit: 100,
        timesUsed: 5,
      };

      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);
      vi.spyOn(discountService["prisma"].coupon, "create").mockResolvedValue(mockCoupon as any);
      vi.spyOn(discountService["prisma"].coupon, "update").mockResolvedValue({
        ...mockCoupon,
        timesUsed: 6,
      } as any);

      const result = await discountService.applyCoupon("SAVE10", "order-1");

      expect(result.code).toBe("SAVE10");
    });

    it("should throw error for non-existent coupon", async () => {
      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(null);

      expect(discountService.applyCoupon("NOTFOUND", "order-1")).rejects.toThrow(AppError);
    });

    it("should throw error for inactive coupon", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "INACTIVE",
        isActive: false,
      };

      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);

      expect(discountService.applyCoupon("INACTIVE", "order-1")).rejects.toThrow(AppError);
    });

    it("should throw error for expired coupon", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "EXPIRED",
        isActive: true,
        expirationDate: new Date(Date.now() - 1000000),
      };

      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);

      expect(discountService.applyCoupon("EXPIRED", "order-1")).rejects.toThrow(AppError);
    });

    it("should throw error when usage limit reached", async () => {
      const mockCoupon = {
        id: "coupon-1",
        code: "LIMITED",
        isActive: true,
        expirationDate: new Date(Date.now() + 1000000),
        usageLimit: 5,
        timesUsed: 5,
      };

      vi.spyOn(discountService["prisma"].coupon, "findUnique").mockResolvedValue(mockCoupon as any);

      expect(discountService.applyCoupon("LIMITED", "order-1")).rejects.toThrow(AppError);
    });
  });
});
