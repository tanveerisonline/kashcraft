import { productComparisonService } from "@/lib/services/products/product-comparison.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4) {
      return Response.json({ error: "Provide 2-4 product IDs" }, { status: 400 });
    }

    const comparison = await productComparisonService.compareProducts(productIds);
    return Response.json(comparison);
  } catch (error) {
    console.error("Comparison error:", error);
    return Response.json({ error: "Comparison failed" }, { status: 400 });
  }
}
