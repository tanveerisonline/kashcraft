import { NextRequest, NextResponse } from "next/server";

// Sample coupons data
const COUPONS: Record<string, any> = {
  SAVE10: {
    code: "SAVE10",
    discount: 10,
    type: "percentage",
    minAmount: 0,
    maxUses: 100,
    used: 45,
    expiresAt: "2026-12-31",
  },
  SAVE20: {
    code: "SAVE20",
    discount: 20,
    type: "percentage",
    minAmount: 50,
    maxUses: 50,
    used: 30,
    expiresAt: "2026-06-30",
  },
  FREESHIP: {
    code: "FREESHIP",
    discount: 10,
    type: "fixed",
    minAmount: 100,
    maxUses: 200,
    used: 150,
    expiresAt: "2026-12-31",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = COUPONS[code.toUpperCase()];

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    // Check if coupon has expired
    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Check max uses
    if (coupon.used >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    // Check minimum amount
    if (amount && amount < coupon.minAmount) {
      return NextResponse.json(
        { error: `Minimum amount required: $${coupon.minAmount}` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (amount || 0) * (coupon.discount / 100);
    } else if (coupon.type === "fixed") {
      discountAmount = coupon.discount;
    }

    return NextResponse.json({
      valid: true,
      data: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
