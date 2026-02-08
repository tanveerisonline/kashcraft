/**
 * Loyalty Program Service
 * Manages points system, tier levels, and rewards redemption
 */

import prisma from "@/lib/db/prisma";
import { EventEmitter } from "events";

export type TierLevel = "bronze" | "silver" | "gold" | "platinum";

export interface LoyaltyAccount {
  userId: string;
  tier: TierLevel;
  totalPoints: number;
  availablePoints: number;
  totalSpent: number;
  totalPurchases: number;
  tierProgress: number;
  nextTierRequirement: number;
  memberSince: Date;
}

export interface PointsHistory {
  id: string;
  userId: string;
  amount: number;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  reason: string;
  transactionId?: string;
  timestamp: Date;
}

export interface TierBenefit {
  tier: TierLevel;
  minPoints: number;
  minSpent: number;
  pointsMultiplier: number;
  benefitDescription: string[];
}

/**
 * Loyalty program service with points and tiers
 */
export class LoyaltyProgramService extends EventEmitter {
  private static instance: LoyaltyProgramService;

  // Tier configuration
  private tierBenefits: TierBenefit[] = [
    {
      tier: "bronze",
      minPoints: 0,
      minSpent: 0,
      pointsMultiplier: 1,
      benefitDescription: [
        "Earn 1 point per $1 spent",
        "Exclusive access to member sales",
        "Birthday bonus of 50 points",
      ],
    },
    {
      tier: "silver",
      minPoints: 500,
      minSpent: 250,
      pointsMultiplier: 1.25,
      benefitDescription: [
        "Earn 1.25 points per $1 spent",
        "Early access to new products",
        "Birthday bonus of 100 points",
        "Free shipping on orders over $50",
      ],
    },
    {
      tier: "gold",
      minPoints: 2000,
      minSpent: 1000,
      pointsMultiplier: 1.5,
      benefitDescription: [
        "Earn 1.5 points per $1 spent",
        "VIP customer support",
        "Birthday bonus of 200 points",
        "Free shipping on all orders",
        "10% off select items",
      ],
    },
    {
      tier: "platinum",
      minPoints: 5000,
      minSpent: 3000,
      pointsMultiplier: 2,
      benefitDescription: [
        "Earn 2 points per $1 spent",
        "Dedicated account manager",
        "Birthday bonus of 500 points",
        "Priority shipping (2-day)",
        "15% off all items",
        "Exclusive platinum events",
      ],
    },
  ];

  // Points values
  private pointsValues = {
    purchaseMultiplier: 1, // 1 point per $1
    signupBonus: 100,
    referralBonus: 100,
    reviewBonus: 10,
    pointValue: 0.01, // 1 point = $0.01
    expiryMonths: 12,
  };

  private constructor() {
    super();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): LoyaltyProgramService {
    if (!LoyaltyProgramService.instance) {
      LoyaltyProgramService.instance = new LoyaltyProgramService();
    }
    return LoyaltyProgramService.instance;
  }

  /**
   * Initialize loyalty account for new user
   */
  async initializeAccount(userId: string): Promise<LoyaltyAccount> {
    try {
      // Check if account exists
      let account = await prisma.loyaltyAccount.findUnique({
        where: { userId },
      });

      if (!account) {
        account = await prisma.loyaltyAccount.create({
          data: {
            userId,
            currentTier: "bronze",
            totalPoints: this.pointsValues.signupBonus,
            availablePoints: this.pointsValues.signupBonus,
            totalSpent: 0,
            totalPurchases: 0,
          },
        });

        // Log signup bonus
        await this.addPointsHistory(
          userId,
          this.pointsValues.signupBonus,
          "earned",
          "Welcome bonus for new member",
          "signup_bonus"
        );

        this.emit("member-joined", { userId, bonus: this.pointsValues.signupBonus });
      }

      return this.getAccount(userId) as any;
    } catch (error) {
      console.error("Error initializing loyalty account:", error);
      throw error;
    }
  }

  /**
   * Get loyalty account
   */
  async getAccount(userId: string): Promise<LoyaltyAccount | null> {
    try {
      const account = await prisma.loyaltyAccount.findUnique({
        where: { userId },
      });

      if (!account) return null;

      // Calculate tier
      const tier = this.calculateTier(account.totalPoints, Number(account.totalSpent));
      const tierBenefit = this.tierBenefits.find((t) => t.tier === tier);

      return {
        userId: account.userId,
        tier,
        totalPoints: account.totalPoints,
        availablePoints: account.availablePoints,
        totalSpent: Number(account.totalSpent),
        totalPurchases: account.totalPurchases,
        tierProgress: this.getTierProgress(tier, Number(account.totalSpent)),
        nextTierRequirement: this.getNextTierRequirement(tier),
        memberSince: account.createdAt,
      };
    } catch (error) {
      console.error("Error getting loyalty account:", error);
      throw error;
    }
  }

  /**
   * Add points for purchase
   */
  async addPointsForPurchase(
    userId: string,
    orderAmount: number,
    orderId: string
  ): Promise<number> {
    try {
      const account = await prisma.loyaltyAccount.findUnique({
        where: { userId },
      });

      if (!account) {
        await this.initializeAccount(userId);
      }

      // Calculate multiplier based on tier
      const tier = this.calculateTier(account?.totalPoints || 0, Number(account?.totalSpent || 0));
      const multiplier = this.tierBenefits.find((t) => t.tier === tier)?.pointsMultiplier || 1;

      const points = Math.floor(orderAmount * this.pointsValues.purchaseMultiplier * multiplier);

      // Update account
      await prisma.loyaltyAccount.update({
        where: { userId },
        data: {
          totalPoints: { increment: points },
          availablePoints: { increment: points },
          totalSpent: { increment: orderAmount },
          totalPurchases: { increment: 1 },
        },
      });

      // Log transaction
      await this.addPointsHistory(userId, points, "earned", `Purchase order #${orderId}`, "purchase", orderId);

      this.emit("points-earned", { userId, points, orderId, tier });

      return points;
    } catch (error) {
      console.error("Error adding points for purchase:", error);
      throw error;
    }
  }

  /**
   * Redeem points
   */
  async redeemPoints(
    userId: string,
    points: number,
    rewardId?: string
  ): Promise<{ success: boolean; discount?: number; message: string }> {
    try {
      const account = await prisma.loyaltyAccount.findUnique({
        where: { userId },
      });

      if (!account) {
        return { success: false, message: "Loyalty account not found" };
      }

      if (account.availablePoints < points) {
        return {
          success: false,
          message: `Insufficient points. Available: ${account.availablePoints}`,
        };
      }

      const discount = points * this.pointsValues.pointValue;

      // Deduct points
      await prisma.loyaltyAccount.update({
        where: { userId },
        data: {
          availablePoints: { decrement: points },
        },
      });

      // Log redemption
      await this.addPointsHistory(
        userId,
        points,
        "redeemed",
        `Redeemed for $${discount.toFixed(2)} discount`,
        "redemption",
        rewardId
      );

      this.emit("points-redeemed", { userId, points, discount });

      return {
        success: true,
        discount,
        message: `${points} points redeemed for $${discount.toFixed(2)}`,
      };
    } catch (error) {
      console.error("Error redeeming points:", error);
      return { success: false, message: "Error redeeming points" };
    }
  }

  /**
   * Get points history
   */
  async getPointsHistory(userId: string, limit: number = 50): Promise<PointsHistory[]> {
    try {
      const history = await prisma.pointsHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return history.map((item) => ({
        id: item.id,
        userId: item.userId,
        amount: item.pointsAmount,
        type: item.pointsType as "earned" | "redeemed" | "expired" | "adjusted",
        reason: item.reason || "",
        transactionId: item.sourceId || undefined,
        timestamp: item.createdAt,
      }));
    } catch (error) {
      console.error("Error getting points history:", error);
      return [];
    }
  }

  /**
   * Get tier benefits
   */
  getTierBenefits(tier: TierLevel): TierBenefit | undefined {
    return this.tierBenefits.find((t) => t.tier === tier);
  }

  /**
   * Get all tier levels
   */
  getAllTiers(): TierBenefit[] {
    return this.tierBenefits;
  }

  /**
   * Add referral bonus
   */
  async addReferralBonus(referrerId: string, refereeId: string): Promise<void> {
    try {
      // Bonus to referrer
      await prisma.loyaltyAccount.update({
        where: { userId: referrerId },
        data: {
          totalPoints: { increment: this.pointsValues.referralBonus },
          availablePoints: { increment: this.pointsValues.referralBonus },
        },
      });

      // Bonus to referee
      await prisma.loyaltyAccount.update({
        where: { userId: refereeId },
        data: {
          totalPoints: { increment: this.pointsValues.referralBonus },
          availablePoints: { increment: this.pointsValues.referralBonus },
        },
      });

      await this.addPointsHistory(
        referrerId,
        this.pointsValues.referralBonus,
        "earned",
        `Referral bonus for user ${refereeId}`,
        "referral_bonus"
      );

      await this.addPointsHistory(
        refereeId,
        this.pointsValues.referralBonus,
        "earned",
        `Welcome bonus - referred by ${referrerId}`,
        "referral_bonus"
      );

      this.emit("referral-bonus", { referrerId, refereeId });
    } catch (error) {
      console.error("Error adding referral bonus:", error);
      throw error;
    }
  }

  /**
   * Add review bonus
   */
  async addReviewBonus(userId: string, productId: string): Promise<void> {
    try {
      // Check if already reviewed
      const existing = await prisma.pointsHistory.findFirst({
        where: {
          userId,
          reason: `Review bonus for product ${productId}`,
        },
      });

      if (existing) return;

      await prisma.loyaltyAccount.update({
        where: { userId },
        data: {
          totalPoints: { increment: this.pointsValues.reviewBonus },
          availablePoints: { increment: this.pointsValues.reviewBonus },
        },
      });

      await this.addPointsHistory(
        userId,
        this.pointsValues.reviewBonus,
        "earned",
        `Review bonus for product ${productId}`,
        "review_bonus"
      );

      this.emit("review-bonus", { userId, productId });
    } catch (error) {
      console.error("Error adding review bonus:", error);
    }
  }

  /**
   * Get top members
   */
  async getTopMembers(limit: number = 10): Promise<any[]> {
    try {
      return await prisma.loyaltyAccount.findMany({
        orderBy: { totalPoints: "desc" },
        take: limit,
        select: {
          userId: true,
          totalPoints: true,
          totalSpent: true,
          currentTier: true,
        },
      });
    } catch (error) {
      console.error("Error getting top members:", error);
      return [];
    }
  }

  /**
   * Get loyalty program summary
   */
  async getLoyaltySummary(): Promise<any> {
    try {
      const totalMembers = await prisma.loyaltyAccount.count();
      const totalPoints = await prisma.loyaltyAccount.aggregate({
        _sum: { totalPoints: true },
      });
      const totalSpent = await prisma.loyaltyAccount.aggregate({
        _sum: { totalSpent: true },
      });

      const membersByTier = await prisma.loyaltyAccount.groupBy({
        by: ["currentTier"],
        _count: true,
      });

      return {
        totalMembers,
        totalPointsIssued: totalPoints._sum?.totalPoints || 0,
        totalMemberSpent: totalSpent._sum?.totalSpent || 0,
        averageSpentPerMember:
          totalMembers > 0 ? Number(totalSpent._sum?.totalSpent || 0) / totalMembers : 0,
        membersByTier: membersByTier.reduce((acc: any, tier: any) => {
          acc[tier.tier] = tier._count;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error("Error getting loyalty summary:", error);
      throw error;
    }
  }

  /**
   * Calculate tier based on points and spending
   */
  private calculateTier(totalPoints: number, totalSpent: number): TierLevel {
    // Check in reverse order (highest first)
    for (let i = this.tierBenefits.length - 1; i >= 0; i--) {
      const tier = this.tierBenefits[i];
      if (totalPoints >= tier.minPoints && totalSpent >= tier.minSpent) {
        return tier.tier;
      }
    }
    return "bronze";
  }

  /**
   * Get tier progress percentage
   */
  private getTierProgress(currentTier: TierLevel, totalSpent: number): number {
    const currentTierInfo = this.tierBenefits.find((t) => t.tier === currentTier);
    const nextTierIndex = this.tierBenefits.findIndex((t) => t.tier === currentTier) + 1;

    if (!currentTierInfo || nextTierIndex >= this.tierBenefits.length) {
      return 100; // Already at max tier
    }

    const nextTierInfo = this.tierBenefits[nextTierIndex];
    const spent = totalSpent - currentTierInfo.minSpent;
    const needed = nextTierInfo.minSpent - currentTierInfo.minSpent;

    return Math.min(100, Math.round((spent / needed) * 100));
  }

  /**
   * Get next tier requirement
   */
  private getNextTierRequirement(currentTier: TierLevel): number {
    const tierIndex = this.tierBenefits.findIndex((t) => t.tier === currentTier);
    if (tierIndex >= this.tierBenefits.length - 1) {
      return 0; // At max tier
    }
    return this.tierBenefits[tierIndex + 1].minSpent;
  }

  /**
   * Record points history entry
   */
  private async addPointsHistory(
    userId: string,
    amount: number,
    type: "earned" | "redeemed" | "expired" | "adjusted",
    reason: string,
    sourceType: string,
    transactionId?: string
  ): Promise<void> {
    try {
      await prisma.pointsHistory.create({
        data: {
          userId,
          pointsAmount: amount,
          pointsType: type,
          reason,
          sourceType,
          sourceId: transactionId,
        },
      });
    } catch (error) {
      console.error("Error recording points history:", error);
    }
  }
}

// Export singleton instance
export const loyaltyProgramService = LoyaltyProgramService.getInstance();
