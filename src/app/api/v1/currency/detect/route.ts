import { multiCurrencyService } from "@/lib/services/localization/multi-currency.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ipAddress = searchParams.get("ip");

    const currency = await multiCurrencyService.detectUserCurrency(ipAddress || undefined);
    return Response.json({ currency });
  } catch (error) {
    console.error("Currency detection error:", error);
    return Response.json({ currency: "USD" }, { status: 200 });
  }
}
