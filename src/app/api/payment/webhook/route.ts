import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Handle payment webhook events
  return NextResponse.json({ message: "Payment webhook endpoint" });
}
