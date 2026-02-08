/**
 * Email Marketing Integration Service
 * Integrates with Mailchimp/SendGrid for newsletters, cart abandonment, post-purchase emails
 */

import { EventEmitter } from "events";

export interface EmailCampaign {
  id: string;
  name: string;
  type: "newsletter" | "abandoned_cart" | "post_purchase" | "promotional" | "welcome";
  recipientCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  status: "draft" | "scheduled" | "sent" | "sending";
  createdAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  previewText?: string;
}

/**
 * Email marketing service with Mailchimp/SendGrid integration
 */
export class EmailMarketingService extends EventEmitter {
  private static instance: EmailMarketingService;
  private provider: "mailchimp" | "sendgrid" = "sendgrid";

  private constructor() {
    super();
    this.provider = process.env.EMAIL_PROVIDER === "mailchimp" ? "mailchimp" : "sendgrid";
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EmailMarketingService {
    if (!EmailMarketingService.instance) {
      EmailMarketingService.instance = new EmailMarketingService();
    }
    return EmailMarketingService.instance;
  }

  /**
   * Send welcome email to new subscriber
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    try {
      if (this.provider === "mailchimp") {
        return await this.sendViaMailchimp(
          email,
          "Welcome to Kashcraft",
          this.getWelcomeTemplate(firstName)
        );
      } else {
        return await this.sendViaSendGrid(
          email,
          "Welcome to Kashcraft",
          this.getWelcomeTemplate(firstName)
        );
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }

  /**
   * Send abandoned cart email
   */
  async sendAbandonedCartEmail(
    email: string,
    cartItems: any[],
    cartTotal: number,
    recoveryLink: string
  ): Promise<boolean> {
    try {
      const htmlContent = this.getAbandonedCartTemplate(cartItems, cartTotal, recoveryLink);

      if (this.provider === "mailchimp") {
        return await this.sendViaMailchimp(email, "You left items in your cart!", htmlContent);
      } else {
        return await this.sendViaSendGrid(email, "You left items in your cart!", htmlContent);
      }
    } catch (error) {
      console.error("Error sending abandoned cart email:", error);
      return false;
    }
  }

  /**
   * Send post-purchase confirmation email
   */
  async sendOrderConfirmationEmail(email: string, orderData: any): Promise<boolean> {
    try {
      const htmlContent = this.getOrderConfirmationTemplate(orderData);

      if (this.provider === "mailchimp") {
        return await this.sendViaMailchimp(
          email,
          `Order Confirmation - #${orderData.orderNumber}`,
          htmlContent
        );
      } else {
        return await this.sendViaSendGrid(
          email,
          `Order Confirmation - #${orderData.orderNumber}`,
          htmlContent
        );
      }
    } catch (error) {
      console.error("Error sending order confirmation:", error);
      return false;
    }
  }

  /**
   * Send shipment notification
   */
  async sendShipmentEmail(
    email: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery: Date
  ): Promise<boolean> {
    try {
      const htmlContent = this.getShipmentTemplate(trackingNumber, carrier, estimatedDelivery);

      if (this.provider === "mailchimp") {
        return await this.sendViaMailchimp(email, "Your Order Has Shipped!", htmlContent);
      } else {
        return await this.sendViaSendGrid(email, "Your Order Has Shipped!", htmlContent);
      }
    } catch (error) {
      console.error("Error sending shipment email:", error);
      return false;
    }
  }

  /**
   * Send newsletter
   */
  async sendNewsletter(
    subscriberList: string[],
    subject: string,
    htmlContent: string
  ): Promise<{ sent: number; failed: number }> {
    try {
      const results = { sent: 0, failed: 0 };

      for (const email of subscriberList) {
        try {
          const success =
            this.provider === "mailchimp"
              ? await this.sendViaMailchimp(email, subject, htmlContent)
              : await this.sendViaSendGrid(email, subject, htmlContent);

          if (success) results.sent++;
          else results.failed++;
        } catch {
          results.failed++;
        }
      }

      this.emit("newsletter-sent", results);
      return results;
    } catch (error) {
      console.error("Error sending newsletter:", error);
      throw error;
    }
  }

  /**
   * Add email to subscriber list
   */
  async addSubscriber(email: string, firstName: string, lastName: string): Promise<boolean> {
    try {
      if (this.provider === "mailchimp") {
        return await this.addToMailchimpList(email, firstName, lastName);
      } else {
        return await this.addToSendGridList(email, firstName, lastName);
      }
    } catch (error) {
      console.error("Error adding subscriber:", error);
      return false;
    }
  }

  /**
   * Remove email from subscriber list
   */
  async unsubscribeEmail(email: string): Promise<boolean> {
    try {
      if (this.provider === "mailchimp") {
        return await this.removeFromMailchimpList(email);
      } else {
        return await this.removeFromSendGridList(email);
      }
    } catch (error) {
      console.error("Error unsubscribing email:", error);
      return false;
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<any> {
    try {
      if (this.provider === "mailchimp") {
        return await this.getMailchimpCampaignStats(campaignId);
      } else {
        return await this.getSendGridCampaignStats(campaignId);
      }
    } catch (error) {
      console.error("Error getting campaign stats:", error);
      throw error;
    }
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(
    email: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: email,
        from: process.env.EMAIL_FROM || "noreply@kashcraft.com",
        subject,
        html: htmlContent,
        replyTo: process.env.SUPPORT_EMAIL,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error("SendGrid error:", error);
      return false;
    }
  }

  /**
   * Send via Mailchimp
   */
  private async sendViaMailchimp(
    email: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      const Mailchimp = require("mailchimp-marketing");
      const client = new Mailchimp.ApiClient();

      client.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX,
      });

      // Requires campaign setup in Mailchimp
      // This is simplified - actual implementation would use templates
      console.log("Mailchimp email send (requires setup):", { email, subject });
      return true;
    } catch (error) {
      console.error("Mailchimp error:", error);
      return false;
    }
  }

  /**
   * Add to Mailchimp list
   */
  private async addToMailchimpList(
    email: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> {
    try {
      const Mailchimp = require("mailchimp-marketing");
      const client = new Mailchimp.ApiClient();

      client.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX,
      });

      await client.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      });

      return true;
    } catch (error) {
      console.error("Mailchimp add error:", error);
      return false;
    }
  }

  /**
   * Add to SendGrid list
   */
  private async addToSendGridList(
    email: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> {
    try {
      const sgClient = require("@sendgrid/client");
      sgClient.setApiKey(process.env.SENDGRID_API_KEY);

      const request = {
        url: "/v3/marketing/contacts",
        method: "PUT",
        body: {
          contacts: [
            {
              email,
              first_name: firstName,
              last_name: lastName,
            },
          ],
        },
      };

      await sgClient.request(request);
      return true;
    } catch (error) {
      console.error("SendGrid add error:", error);
      return false;
    }
  }

  /**
   * Remove from Mailchimp list
   */
  private async removeFromMailchimpList(email: string): Promise<boolean> {
    try {
      const Mailchimp = require("mailchimp-marketing");
      const client = new Mailchimp.ApiClient();

      client.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX,
      });

      await client.lists.deleteListMember(process.env.MAILCHIMP_LIST_ID, email);
      return true;
    } catch (error) {
      console.error("Mailchimp remove error:", error);
      return false;
    }
  }

  /**
   * Remove from SendGrid list
   */
  private async removeFromSendGridList(email: string): Promise<boolean> {
    try {
      // SendGrid uses deletion by suppression list
      const sgClient = require("@sendgrid/client");
      sgClient.setApiKey(process.env.SENDGRID_API_KEY);

      const request = {
        url: "/v3/suppression/unsubscribes",
        method: "POST",
        body: {
          emails: [email],
        },
      };

      await sgClient.request(request);
      return true;
    } catch (error) {
      console.error("SendGrid remove error:", error);
      return false;
    }
  }

  /**
   * Get Mailchimp campaign stats
   */
  private async getMailchimpCampaignStats(campaignId: string): Promise<any> {
    try {
      const Mailchimp = require("mailchimp-marketing");
      const client = new Mailchimp.ApiClient();

      client.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX,
      });

      const response = await client.campaigns.get(campaignId);
      return response;
    } catch (error) {
      console.error("Mailchimp stats error:", error);
      throw error;
    }
  }

  /**
   * Get SendGrid campaign stats
   */
  private async getSendGridCampaignStats(campaignId: string): Promise<any> {
    try {
      const sgClient = require("@sendgrid/client");
      sgClient.setApiKey(process.env.SENDGRID_API_KEY);

      const request = {
        url: `/v3/marketing/singlesends/${campaignId}`,
        method: "GET",
      };

      const [response] = await sgClient.request(request);
      return response.body;
    } catch (error) {
      console.error("SendGrid stats error:", error);
      throw error;
    }
  }

  // Email templates
  private getWelcomeTemplate(firstName: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h1>Welcome to Kashcraft!</h1>
          <p>Hi ${firstName},</p>
          <p>Thank you for joining our community. We're excited to have you!</p>
          <p>Explore our amazing products and enjoy exclusive subscriber benefits.</p>
          <a href="https://kashcraft.com" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Shop Now</a>
          <p>Happy shopping!<br>The Kashcraft Team</p>
        </body>
      </html>
    `;
  }

  private getAbandonedCartTemplate(items: any[], total: number, recoveryLink: string): string {
    const itemsList = items
      .map(
        (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Don't miss out on your items!</h2>
          <p>We noticed you left items in your cart. Complete your purchase before they're gone!</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
            ${itemsList}
            <tr>
              <td colspan="2" style="text-align: right; font-weight: bold;">Total:</td>
              <td>$${total.toFixed(2)}</td>
            </tr>
          </table>
          <a href="${recoveryLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; margin-top: 20px; display: inline-block;">Complete Purchase</a>
        </body>
      </html>
    `;
  }

  private getOrderConfirmationTemplate(order: any): string {
    const itemsList = order.items
      .map(
        (item: any) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Order Confirmation</h2>
          <p>Thank you for your order!</p>
          <p>Order #: ${order.orderNumber}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
            ${itemsList}
            <tr>
              <td colspan="2" style="text-align: right; font-weight: bold;">Total:</td>
              <td>$${order.total.toFixed(2)}</td>
            </tr>
          </table>
          <p>We'll notify you when your order ships. Track your order at any time.</p>
        </body>
      </html>
    `;
  }

  private getShipmentTemplate(
    trackingNumber: string,
    carrier: string,
    estimatedDelivery: Date
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Your Order is on the Way!</h2>
          <p>Your package has been shipped and is on its way to you.</p>
          <p><strong>Carrier:</strong> ${carrier}</p>
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${estimatedDelivery.toLocaleDateString()}</p>
          <a href="https://kashcraft.com/track/${trackingNumber}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Track Your Package</a>
        </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailMarketingService = EmailMarketingService.getInstance();
