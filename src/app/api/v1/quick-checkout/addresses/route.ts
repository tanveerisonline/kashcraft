import { quickBuyService } from "@/lib/services/checkout/quick-buy.service";
import { auth } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      label,
      fullName,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    } = body;

    const address = await quickBuyService.saveAddress(
      session.user.id,
      type,
      label,
      fullName,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    );

    return Response.json(address);
  } catch (error) {
    console.error("Address error:", error);
    return Response.json({ error: "Failed to save address" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const addresses = await quickBuyService.getAddresses(session.user.id, type || undefined);
    return Response.json({ addresses });
  } catch (error) {
    console.error("Addresses error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
