import { giftCardVoucherService } from "@/lib/services/ecommerce/gift-card-voucher.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    const result = await giftCardVoucherService.validateVoucher(code, orderTotal);

    return Response.json(result);
  } catch (error) {
    console.error("Voucher validation error:", error);
    return Response.json({ valid: false, error: "Invalid voucher" }, { status: 400 });
  }
}
