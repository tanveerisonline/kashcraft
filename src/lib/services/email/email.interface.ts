// src/lib/services/email/email.interface.ts

// Placeholder for an Order type. This should be defined based on your application's actual Order structure.
export type Order = {
  id: string;
  userId: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: Date;
  // Add other relevant order details
};

export interface EmailContent {
  to: string;
  subject: string;
  body: string;
  html?: string; // Optional HTML content
}

export interface IEmailService {
  sendEmail(content: EmailContent): Promise<boolean>;
  sendVerificationEmail(to: string, token: string): Promise<boolean>;
  sendPasswordResetEmail(to: string, token: string): Promise<boolean>;
  sendOrderConfirmation(to: string, order: Order): Promise<boolean>;
  sendShippingNotification(to: string, order: Order, tracking: string): Promise<boolean>;
}

export enum EmailProvider {
  SENDGRID = "sendgrid",
  AWS_SES = "aws_ses",
  RESEND = "resend",
}
