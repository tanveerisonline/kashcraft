// src/lib/services/notification/notification.service.ts

import { Order, Product } from "@prisma/client";
import { IEmailService } from "../email/email.interface";
import { LoggerService } from "../logger/logger.service";

export class NotificationService {
  constructor(
    private emailService: IEmailService,
    private logger: LoggerService
  ) {}

  async sendOrderConfirmation(userId: string, order: Order): Promise<void> {
    // In a real application, you'd fetch the user's email based on userId
    const userEmail = "user@example.com"; // Placeholder
    const subject = `Order Confirmation #${order.orderNumber}`;
    const body = `Your order #${order.orderNumber} has been confirmed. Total: $${order.total.toFixed(2)}.`;

    try {
      await this.emailService.sendEmail({ to: userEmail, subject, body });
      this.logger.info(
        `Order confirmation email sent to ${userEmail} for order ${order.orderNumber}`
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send order confirmation email for order ${order.orderNumber}`,
        error
      );
    }
  }

  async sendShippingUpdate(userId: string, order: Order, tracking: string): Promise<void> {
    const userEmail = "user@example.com"; // Placeholder
    const subject = `Shipping Update for Order #${order.orderNumber}`;
    const body = `Your order #${order.orderNumber} has been shipped! Tracking number: ${tracking}.`;

    try {
      await this.emailService.sendEmail({ to: userEmail, subject, body });
      this.logger.info(`Shipping update email sent to ${userEmail} for order ${order.orderNumber}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send shipping update email for order ${order.orderNumber}`,
        error
      );
    }
  }

  async sendLowStockAlert(product: Product): Promise<void> {
    // In a real application, this would send an alert to an admin or inventory manager
    const adminEmail = "admin@example.com"; // Placeholder
    const subject = `Low Stock Alert: ${product.name}`;
    const body = `Product ${product.name} (ID: ${product.id}) is running low on stock. Current quantity: ${product.stockQuantity}.`;

    try {
      await this.emailService.sendEmail({ to: adminEmail, subject, body });
      this.logger.warn(`Low stock alert sent for product ${product.name}`);
    } catch (error: any) {
      this.logger.error(`Failed to send low stock alert for product ${product.name}`, error);
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const subject = "Password Reset Request";
    const resetLink = `https://your-ecommerce.com/reset-password?token=${token}`; // Placeholder
    const body = `You requested a password reset. Click here to reset your password: ${resetLink}`;

    try {
      await this.emailService.sendEmail({ to: email, subject, body });
      this.logger.info(`Password reset email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
    }
  }
}
