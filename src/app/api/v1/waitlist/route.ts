import { productWaitlistService } from "@/lib/services/products/product-waitlist.service";
import { auth } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, email } = body;

    const entry = await productWaitlistService.addToWaitlist(
      session.user.id,
      productId,
      email || session.user.email
    );

    const position = await productWaitlistService.getWaitlistPosition(session.user.id, productId);

    return Response.json({ success: true, position, waitlistId: entry.id });
  } catch (error) {
    console.error("Waitlist error:", error);
    return Response.json({ error: "Failed to add to waitlist" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const waitlist = await productWaitlistService.getUserWaitlist(session.user.id);
    return Response.json({ waitlist });
  } catch (error) {
    console.error("Waitlist retrieval error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
