// src/lib/services/payment/payment.factory.ts

import { IPaymentGateway, PaymentProvider } from "./payment.interface";
import { RazorpayPaymentGateway } from "./gateways/razorpay.gateway";
import { PayPalPaymentGateway } from "./gateways/paypal.gateway";
import { StripePaymentGateway } from "./gateways/stripe.gateway";

export class PaymentGatewayFactory {
  createPaymentGateway(provider: PaymentProvider): IPaymentGateway {
    return PaymentGatewayFactory.create(provider);
  }

  static create(provider: PaymentProvider): IPaymentGateway {
    switch (provider) {
      case PaymentProvider.STRIPE:
        return new StripePaymentGateway();
      case PaymentProvider.PAYPAL:
        return new PayPalPaymentGateway();
      case PaymentProvider.RAZORPAY:
        return new RazorpayPaymentGateway();
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }
}
