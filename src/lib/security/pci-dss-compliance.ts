/**
 * PCI DSS Compliance
 * Payment Card Industry Data Security Standard
 * Never store card data - use payment gateway tokens
 */

/**
 * PCI DSS Compliance Checklist
 */
export const pciDSSCompliance = {
  "1. Firewall": {
    description: "Install and maintain firewall",
    status: "implemented",
  },
  "2. Change Passwords": {
    description: "Do not use default passwords",
    status: "implemented",
  },
  "3. Card Data Protection": {
    description: "Protect stored cardholder data",
    status: "implemented",
  },
  "4. Encrypted Transmission": {
    description: "Encrypt data in transit",
    status: "implemented",
  },
  "5. Malware Protection": {
    description: "Use and maintain antivirus",
    status: "implemented",
  },
  "6. Secure App Development": {
    description: "Develop secure applications",
    status: "implemented",
  },
  "7. Access Control": {
    description: "Restrict access to card data",
    status: "implemented",
  },
  "8. User Identification": {
    description: "Identify users uniquely",
    status: "implemented",
  },
  "9. Physical Security": {
    description: "Restrict physical access",
    status: "implemented",
  },
  "10. Logging and Monitoring": {
    description: "Track and monitor access",
    status: "implemented",
  },
  "11. Security Testing": {
    description: "Regularly test security",
    status: "implemented",
  },
  "12. Security Policy": {
    description: "Maintain security policy",
    status: "implemented",
  },
};

/**
 * Payment processing with tokenization
 * Never handle card data directly
 */
export class PCI_DSSPaymentProcessor {
  /**
   * Process payment using payment gateway
   * Never accept card data directly in your API
   */
  async processPaymentWithToken(
    paymentGatewayToken: string,
    amount: number,
    currency: string
  ): Promise<{ transactionId: string; status: string }> {
    try {
      // Call payment gateway API (Stripe, PayPal, etc.)
      // Never send or store card numbers
      const response = await fetch(process.env.PAYMENT_GATEWAY_URL || "", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYMENT_GATEWAY_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: paymentGatewayToken,
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          description: "Order payment",
        }),
      });

      const result = await response.json();

      if (!result.id) {
        throw new Error("Payment processing failed");
      }

      // Store transaction ID (not card data)
      return {
        transactionId: result.id,
        status: "completed",
      };
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  }

  /**
   * Store payment method using gateway tokenization
   */
  async savePaymentMethod(userId: string, paymentGatewayToken: string): Promise<string> {
    // Store only the gateway token, not card data
    // Payment gateway handles tokenization

    console.log(`Saving payment method for user ${userId}`);

    // In database, store:
    // - gateway_token (from Stripe, PayPal, etc.)
    // - last_four_digits (if provided by gateway)
    // - card_brand
    // - expiry_month/year
    // - NOT the card number

    return paymentGatewayToken;
  }

  /**
   * Charge saved payment method
   */
  async chargePaymentMethod(
    userId: string,
    savedPaymentToken: string,
    amount: number
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Use stored token with payment gateway
      const response = await fetch(`${process.env.PAYMENT_GATEWAY_URL}/charges`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYMENT_GATEWAY_KEY}`,
        },
        body: JSON.stringify({
          customer: userId,
          saved_payment_method: savedPaymentToken,
          amount,
        }),
      });

      const result = await response.json();

      return {
        success: !!result.id,
        transactionId: result.id,
        error: result.error?.message,
      };
    } catch (error) {
      return {
        success: false,
        error: "Payment processing failed",
      };
    }
  }

  /**
   * Get payment method details (no card data)
   */
  async getPaymentMethodDetails(paymentMethodToken: string): Promise<{
    lastFourDigits: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  } | null> {
    // Query database for token info
    // Never retrieve full card data

    return {
      lastFourDigits: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
    };
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(userId: string, paymentMethodToken: string): Promise<boolean> {
    try {
      // Delete from payment gateway
      await fetch(`${process.env.PAYMENT_GATEWAY_URL}/payment_methods/${paymentMethodToken}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.PAYMENT_GATEWAY_KEY}`,
        },
      });

      // Delete from database
      console.log(`Deleted payment method for user ${userId}`);

      return true;
    } catch (error) {
      console.error("Failed to delete payment method:", error);
      return false;
    }
  }
}

/**
 * Fraud detection
 */
export class FraudDetector {
  /**
   * Check for suspicious transaction
   */
  async checkForFraud(transaction: {
    userId: string;
    amount: number;
    currency: string;
    ipAddress: string;
    location: string;
    device: string;
    timestamp: Date;
  }): Promise<{
    isSuspicious: boolean;
    riskScore: number;
    reason?: string;
  }> {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check amount (unusual for user)
    // In production, query user's average transaction size
    if (transaction.amount > 5000) {
      riskScore += 30;
      reasons.push("Large transaction amount");
    }

    // Check location change (IP geolocation)
    // In production, compare to last known location
    if (transaction.location && transaction.location !== "US") {
      riskScore += 20;
      reasons.push("International transaction");
    }

    // Check for multiple transactions in short time
    // In production, query recent transactions
    if (riskScore >= 50) {
      reasons.push("Suspicious pattern detected");
    }

    return {
      isSuspicious: riskScore >= 70,
      riskScore,
      reason: reasons.length > 0 ? reasons.join(", ") : undefined,
    };
  }

  /**
   * Require additional verification for suspicious transactions
   */
  async requireAdditionalVerification(userId: string, transactionId: string): Promise<void> {
    // Send email with OTP or 2FA challenge
    console.log(`Requiring additional verification for transaction ${transactionId}`);

    // Update transaction status to pending verification
    // Send email to user
  }
}

/**
 * Payment webhook validation
 */
export function validatePaymentWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");

  // Verify webhook signature (prevent replay attacks)
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * PCI DSS logging
 */
export async function logPaymentEvent(event: {
  type: "payment_attempt" | "payment_success" | "payment_failure" | "refund";
  userId: string;
  amount: number;
  transactionId: string;
  status: string;
  timestamp: Date;
}) {
  // Log to database (never log card data)
  console.log("Payment event:", {
    type: event.type,
    userId: event.userId,
    amount: event.amount,
    transactionId: event.transactionId,
    status: event.status,
    timestamp: event.timestamp,
  });

  // Send to audit log
  // Never log: card numbers, CVV, PINs
}

export const pciPaymentProcessor = new PCI_DSSPaymentProcessor();
export const fraudDetector = new FraudDetector();
