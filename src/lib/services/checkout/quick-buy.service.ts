/**
 * Quick Buy Service
 * Enables one-click checkout with saved payment methods and addresses
 */

import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/middleware/app-error";

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  type: "credit_card" | "paypal" | "apple_pay" | "google_pay";
  token: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface SavedAddress {
  id: string;
  userId: string;
  type: "shipping" | "billing";
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface QuickCheckoutSession {
  sessionId: string;
  userId: string;
  productId: string;
  quantity: number;
  paymentMethodId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  createdAt: Date;
}

/**
 * Quick buy service with saved methods and addresses
 */
export class QuickBuyService {
  private static instance: QuickBuyService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): QuickBuyService {
    if (!QuickBuyService.instance) {
      QuickBuyService.instance = new QuickBuyService();
    }
    return QuickBuyService.instance;
  }

  // ===== Payment Methods =====

  /**
   * Save payment method
   */
  async savePaymentMethod(
    userId: string,
    type: SavedPaymentMethod["type"],
    token: string,
    last4: string,
    cardholderName: string,
    expiryMonth?: number,
    expiryYear?: number,
    isDefault: boolean = false
  ): Promise<SavedPaymentMethod> {
    try {
      // If setting as default, unset others
      if (isDefault) {
        await prisma.savedPaymentMethod.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const method = await prisma.savedPaymentMethod.create({
        data: {
          userId,
          type,
          token,
          last4,
          cardholderName,
          expiryMonth,
          expiryYear,
          isDefault,
        },
      });

      return this.mapPaymentMethod(method);
    } catch (error) {
      console.error("Error saving payment method:", error);
      throw error;
    }
  }

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(userId: string): Promise<SavedPaymentMethod[]> {
    try {
      const methods = await prisma.savedPaymentMethod.findMany({
        where: { userId },
        orderBy: { isDefault: "desc" },
      });

      return methods.map((m) => this.mapPaymentMethod(m));
    } catch (error) {
      console.error("Error getting payment methods:", error);
      return [];
    }
  }

  /**
   * Get default payment method
   */
  async getDefaultPaymentMethod(userId: string): Promise<SavedPaymentMethod | null> {
    try {
      const method = await prisma.savedPaymentMethod.findFirst({
        where: { userId, isDefault: true },
      });

      return method ? this.mapPaymentMethod(method) : null;
    } catch (error) {
      console.error("Error getting default payment method:", error);
      return null;
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    methodId: string,
    userId: string,
    updates: Partial<SavedPaymentMethod>
  ): Promise<SavedPaymentMethod | null> {
    try {
      // Verify ownership
      const existing = await prisma.savedPaymentMethod.findUnique({
        where: { id: methodId },
      });

      if (!existing || existing.userId !== userId) {
        return null;
      }

      // If setting as default, unset others
      if (updates.isDefault) {
        await prisma.savedPaymentMethod.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.savedPaymentMethod.update({
        where: { id: methodId },
        data: {
          cardholderName: updates.cardholderName,
          isDefault: updates.isDefault,
        },
      });

      return this.mapPaymentMethod(updated);
    } catch (error) {
      console.error("Error updating payment method:", error);
      return null;
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string, userId: string): Promise<boolean> {
    try {
      const method = await prisma.savedPaymentMethod.findUnique({
        where: { id: methodId },
      });

      if (!method || method.userId !== userId) {
        return false;
      }

      await prisma.savedPaymentMethod.delete({
        where: { id: methodId },
      });

      // If was default, set another as default
      if (method.isDefault) {
        const other = await prisma.savedPaymentMethod.findFirst({
          where: { userId },
        });

        if (other) {
          await prisma.savedPaymentMethod.update({
            where: { id: other.id },
            data: { isDefault: true },
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting payment method:", error);
      return false;
    }
  }

  // ===== Addresses =====

  /**
   * Save address
   */
  async saveAddress(
    userId: string,
    type: SavedAddress["type"],
    label: string,
    fullName: string,
    streetAddress: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
    phone: string,
    isDefault: boolean = false
  ): Promise<SavedAddress> {
    try {
      // If setting as default, unset others of same type
      if (isDefault) {
        await prisma.savedAddress.updateMany({
          where: { userId, type },
          data: { isDefault: false },
        });
      }

      const address = await prisma.savedAddress.create({
        data: {
          userId,
          type,
          label,
          fullName,
          streetAddress,
          city,
          state,
          postalCode,
          country,
          phone,
          isDefault,
        },
      });

      return this.mapAddress(address);
    } catch (error) {
      console.error("Error saving address:", error);
      throw error;
    }
  }

  /**
   * Get saved addresses
   */
  async getAddresses(userId: string, type?: SavedAddress["type"]): Promise<SavedAddress[]> {
    try {
      const addresses = await prisma.savedAddress.findMany({
        where: type ? { userId, type } : { userId },
        orderBy: { isDefault: "desc" },
      });

      return addresses.map((a) => this.mapAddress(a));
    } catch (error) {
      console.error("Error getting addresses:", error);
      return [];
    }
  }

  /**
   * Get default address
   */
  async getDefaultAddress(
    userId: string,
    type: SavedAddress["type"]
  ): Promise<SavedAddress | null> {
    try {
      const address = await prisma.savedAddress.findFirst({
        where: { userId, type, isDefault: true },
      });

      return address ? this.mapAddress(address) : null;
    } catch (error) {
      console.error("Error getting default address:", error);
      return null;
    }
  }

  /**
   * Update address
   */
  async updateAddress(
    addressId: string,
    userId: string,
    updates: Partial<SavedAddress>
  ): Promise<SavedAddress | null> {
    try {
      const existing = await prisma.savedAddress.findUnique({
        where: { id: addressId },
      });

      if (!existing || existing.userId !== userId) {
        return null;
      }

      const updated = await prisma.savedAddress.update({
        where: { id: addressId },
        data: {
          label: updates.label,
          fullName: updates.fullName,
          streetAddress: updates.streetAddress,
          city: updates.city,
          state: updates.state,
          postalCode: updates.postalCode,
          country: updates.country,
          phone: updates.phone,
          isDefault: updates.isDefault,
        },
      });

      return this.mapAddress(updated);
    } catch (error) {
      console.error("Error updating address:", error);
      return null;
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    try {
      const address = await prisma.savedAddress.findUnique({
        where: { id: addressId },
      });

      if (!address || address.userId !== userId) {
        return false;
      }

      await prisma.savedAddress.delete({
        where: { id: addressId },
      });

      // If was default, set another as default
      if (address.isDefault) {
        const other = await prisma.savedAddress.findFirst({
          where: { userId, type: address.type },
        });

        if (other) {
          await prisma.savedAddress.update({
            where: { id: other.id },
            data: { isDefault: true },
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  }

  // ===== Quick Checkout =====

  /**
   * Create quick checkout session
   */
  async createQuickCheckoutSession(
    userId: string,
    productId: string,
    quantity: number,
    paymentMethodId: string,
    shippingAddressId: string,
    billingAddressId?: string
  ): Promise<QuickCheckoutSession> {
    try {
      // Verify payment method ownership
      const paymentMethod = await prisma.savedPaymentMethod.findUnique({
        where: { id: paymentMethodId },
      });

      if (!paymentMethod || paymentMethod.userId !== userId) {
        throw new AppError(400, "Invalid payment method", "INVALID_PAYMENT_METHOD", true);
      }

      // Verify address ownership
      const shippingAddress = await prisma.savedAddress.findUnique({
        where: { id: shippingAddressId },
      });

      if (!shippingAddress || shippingAddress.userId !== userId) {
        throw new AppError(400, "Invalid shipping address", "INVALID_SHIPPING_ADDRESS", true);
      }

      if (billingAddressId) {
        const billingAddress = await prisma.savedAddress.findUnique({
          where: { id: billingAddressId },
        });

        if (!billingAddress || billingAddress.userId !== userId) {
          throw new AppError(400, "Invalid billing address", "INVALID_BILLING_ADDRESS", true);
        }
      }

      // Create session
      const sessionId = `qc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const session: QuickCheckoutSession = {
        sessionId,
        userId,
        productId,
        quantity,
        paymentMethodId,
        shippingAddressId,
        billingAddressId,
        createdAt: new Date(),
      };

      // Store in cache (would use Redis in production)
      // For now, store in database
      await prisma.quickCheckoutSession.create({
        data: session,
      });

      return session;
    } catch (error) {
      console.error("Error creating quick checkout session:", error);
      throw error;
    }
  }

  /**
   * Get quick checkout session
   */
  async getQuickCheckoutSession(
    sessionId: string,
    userId: string
  ): Promise<QuickCheckoutSession | null> {
    try {
      const session = await prisma.quickCheckoutSession.findUnique({
        where: { sessionId },
      });

      if (!session || session.userId !== userId) {
        return null;
      }

      return session;
    } catch (error) {
      console.error("Error getting quick checkout session:", error);
      return null;
    }
  }

  /**
   * Clean up expired sessions (older than 1 hour)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const result = await prisma.quickCheckoutSession.deleteMany({
        where: {
          createdAt: { lt: oneHourAgo },
        },
      });

      return result.count;
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return 0;
    }
  }

  /**
   * Map database method to interface
   */
  private mapPaymentMethod(method: any): SavedPaymentMethod {
    return {
      id: method.id,
      userId: method.userId,
      type: method.type,
      token: method.token,
      last4: method.last4,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      cardholderName: method.cardholderName,
      isDefault: method.isDefault,
      createdAt: method.createdAt,
    };
  }

  /**
   * Map database address to interface
   */
  private mapAddress(address: any): SavedAddress {
    return {
      id: address.id,
      userId: address.userId,
      type: address.type,
      label: address.label,
      fullName: address.fullName,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
    };
  }
}

// Export singleton instance
export const quickBuyService = QuickBuyService.getInstance();
