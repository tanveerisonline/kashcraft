// src/lib/services/payment/payment.interface.ts

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  // Add other relevant fields for a payment intent
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  message?: string;
  // Add other relevant fields for a payment result
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
  // Add other relevant fields for a refund result
}

export interface PaymentStatus {
  status: string; // e.g., 'pending', 'succeeded', 'failed', 'refunded'
  // Add other relevant fields for payment status
}

export interface IPaymentGateway {
  processPayment(orderId: string, amount: number): Promise<PaymentResult>;
  createPaymentIntent(amount: number, currency: string, metadata: object): Promise<PaymentIntent>;
  capturePayment(paymentId: string): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  RAZORPAY = 'razorpay',
  // Add other payment providers as needed
}
