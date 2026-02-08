import { NextRequest, NextResponse } from "next/server";

// Sample orders storage
const orders: Record<string, any> = {};

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get("id");

    if (orderId) {
      const order = orders[orderId];
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ data: order });
    }

    return NextResponse.json({
      data: Object.values(orders),
      total: Object.keys(orders).length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      shippingData,
      paymentData,
      shippingMethod,
      subtotal,
      tax,
      shipping,
      total,
      coupon,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingData || !paymentData) {
      return NextResponse.json({ error: "Shipping and payment data required" }, { status: 400 });
    }

    // Create order
    const orderId = `ORD-${Date.now()}`;
    const order = {
      id: orderId,
      orderNumber: `#${orderId}`,
      date: new Date().toISOString().split("T")[0],
      status: "PENDING",
      items,
      shippingData,
      paymentData: {
        ...paymentData,
        cardNumber: "*".repeat(12) + paymentData.cardNumber.slice(-4),
      },
      shippingMethod,
      subtotal,
      tax,
      shipping,
      total,
      coupon,
      createdAt: new Date().toISOString(),
    };

    orders[orderId] = order;

    // TODO: Process payment
    // TODO: Update inventory
    // TODO: Send confirmation email

    return NextResponse.json(
      { message: "Order created successfully", data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
