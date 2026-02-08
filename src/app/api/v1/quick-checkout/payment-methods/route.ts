import { quickBuyService } from "@/lib/services/checkout/quick-buy.service";
import { auth } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, token, last4, cardholderName, expiryMonth, expiryYear, isDefault } = body;

    const method = await quickBuyService.savePaymentMethod(
      session.user.id,
      type,
      token,
      last4,
      cardholderName,
      expiryMonth,
      expiryYear,
      isDefault
    );

    return Response.json(method);
  } catch (error) {
    console.error("Payment method error:", error);
    return Response.json({ error: "Failed to save payment method" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const methods = await quickBuyService.getPaymentMethods(session.user.id);
    return Response.json({ methods });
  } catch (error) {
    console.error("Payment methods error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
