import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const event = await request.json();

    // In production, verify the webhook signature using PayPal SDK
    // const isValid = await paypalClient.verifyWebhookSignature({
    //   transmission_id: request.headers.get('paypal-transmission-id'),
    //   transmission_time: request.headers.get('paypal-transmission-time'),
    //   cert_url: request.headers.get('paypal-cert-url'),
    //   auth_algo: request.headers.get('paypal-auth-algo'),
    //   transmission_sig: request.headers.get('paypal-transmission-sig'),
    //   webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    //   webhook_event: event
    // });

    // Handle different PayPal event types
    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED": {
        const orderId = event.resource.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "AUTHORIZED",
              paymentId: event.resource.id,
            },
          });
          console.log(`PayPal order approved: ${orderId}`);
        }
        break;
      }

      case "PAYMENT.CAPTURE.COMPLETED": {
        const orderId = event.resource.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
              paymentId: event.resource.id,
            },
          });
          console.log(`PayPal payment captured: ${orderId}`);
        }
        break;
      }

      case "PAYMENT.CAPTURE.DENIED": {
        const orderId = event.resource.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
              status: "PAYMENT_FAILED",
            },
          });
          console.log(`PayPal payment denied: ${orderId}`);
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        console.log("Subscription cancelled:", event.resource.id);
        break;
      }

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error handling PayPal webhook:", error);
    return NextResponse.json({ message: "Webhook error", error: error.message }, { status: 400 });
  }
}
