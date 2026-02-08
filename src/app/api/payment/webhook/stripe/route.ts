import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import crypto from "crypto";

// Verify Stripe webhook signature
function verifyStripeSignature(body: Buffer, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;

  const hash = crypto.createHmac("sha256", secret).update(body.toString()).digest("hex");

  return hash === signature.replace("v1,", "");
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ message: "Missing Stripe signature" }, { status: 400 });
    }

    const body = await request.text();
    const event = JSON.parse(body);

    // In production, verify the signature
    // const isValid = verifyStripeSignature(
    //   Buffer.from(body),
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET || ''
    // );
    // if (!isValid) {
    //   return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    // }

    // Handle different Stripe event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
              paymentId: paymentIntent.id,
            },
          });
          console.log(`Payment succeeded for order ${orderId}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
              status: "PAYMENT_FAILED",
            },
          });
          console.log(`Payment failed for order ${orderId}`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const orderId = charge.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "REFUNDED",
              status: "REFUNDED",
            },
          });
          console.log(`Payment refunded for order ${orderId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error handling Stripe webhook:", error);
    return NextResponse.json({ message: "Webhook error", error: error.message }, { status: 400 });
  }
}
