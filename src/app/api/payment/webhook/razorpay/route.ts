import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import crypto from "crypto";

// Verify Razorpay webhook signature
function verifyRazorpaySignature(
  webhookSecret: string,
  payload: string,
  signature: string
): boolean {
  const hash = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");

  return hash === signature;
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    const body = await request.text();

    if (!signature) {
      return NextResponse.json({ message: "Missing Razorpay signature" }, { status: 400 });
    }

    // In production, verify the signature
    // const isValid = verifyRazorpaySignature(
    //   process.env.RAZORPAY_SECRET || '',
    //   body,
    //   signature
    // );
    // if (!isValid) {
    //   return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    // }

    const event = JSON.parse(body);

    // Handle different Razorpay event types
    switch (event.event) {
      case "payment.authorized": {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "AUTHORIZED",
              paymentId: payment.id,
            },
          });
          console.log(`Razorpay payment authorized: ${orderId}`);
        }
        break;
      }

      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
              paymentId: payment.id,
            },
          });
          console.log(`Razorpay payment captured: ${orderId}`);
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
              status: "PAYMENT_FAILED",
            },
          });
          console.log(`Razorpay payment failed: ${orderId}`);
        }
        break;
      }

      case "refund.created": {
        const refund = event.payload.refund.entity;
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "REFUNDED",
              status: "REFUNDED",
            },
          });
          console.log(`Razorpay refund created: ${orderId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled Razorpay event type: ${event.event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error handling Razorpay webhook:", error);
    return NextResponse.json({ message: "Webhook error", error: error.message }, { status: 400 });
  }
}
