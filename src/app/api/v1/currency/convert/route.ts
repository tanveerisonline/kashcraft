import { multiCurrencyService } from "@/lib/services/localization/multi-currency.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || "USD";
    const to = searchParams.get("to") || "USD";
    const amount = parseFloat(searchParams.get("amount") || "1");

    const result = multiCurrencyService.convertCurrency(amount, from, to);
    return Response.json(result);
  } catch (error) {
    console.error("Currency conversion error:", error);
    return Response.json({ error: "Conversion failed" }, { status: 400 });
  }
}
