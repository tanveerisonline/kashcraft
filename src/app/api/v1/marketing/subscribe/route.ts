import { emailMarketingService } from "@/lib/services/marketing/email-marketing.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName } = body;

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    const result = await emailMarketingService.addSubscriber(email, firstName, lastName);

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return Response.json({ error: "Subscription failed" }, { status: 400 });
  }
}
