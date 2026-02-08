import { NextRequest, NextResponse } from "next/server";

// Sample orders data - Replace with database queries
const SAMPLE_ORDERS = [
  {
    id: "1001",
    orderNumber: "#ORD-001",
    date: "2025-01-20",
    status: "DELIVERED",
    items: [{ id: "1", name: "Handwoven Carpet", price: 299.99, quantity: 1 }],
    total: 320.99,
    shipping: 10,
    tax: 11,
  },
  {
    id: "1002",
    orderNumber: "#ORD-002",
    date: "2025-01-15",
    status: "SHIPPED",
    items: [{ id: "2", name: "Pashmina Shawl", price: 199.99, quantity: 2 }],
    total: 429.98,
    shipping: 10,
    tax: 20,
  },
  {
    id: "1003",
    orderNumber: "#ORD-003",
    date: "2025-01-10",
    status: "PENDING",
    items: [
      { id: "3", name: "Walnut Wood Box", price: 79.99, quantity: 1 },
      { id: "5", name: "Silk Scarf", price: 59.99, quantity: 1 },
    ],
    total: 149.98,
    shipping: 0,
    tax: 10,
  },
];

export async function GET(request: NextRequest) {
  try {
    // TODO: Get actual user ID from session
    const userId = "user-123"; // Placeholder

    // TODO: Fetch orders from database filtered by userId
    // For now, return sample orders

    return NextResponse.json({
      data: SAMPLE_ORDERS,
      total: SAMPLE_ORDERS.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Create order in database
    return NextResponse.json(
      { message: "Order created", data: { id: "new-order-id", ...body } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
