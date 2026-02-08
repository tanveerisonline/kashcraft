import { realTimeInventoryService } from "@/lib/services/inventory/real-time-inventory.service";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const productIds = searchParams.get("productIds")?.split(",");

    if (productId) {
      const stock = await realTimeInventoryService.getStockLevel(productId);
      return Response.json(stock);
    }

    if (productIds && productIds.length > 0) {
      const stocks = await Promise.all(
        productIds.map((id) => realTimeInventoryService.getStockLevel(id))
      );
      return Response.json({ stocks });
    }

    return Response.json({ error: "Missing productId or productIds" }, { status: 400 });
  } catch (error) {
    console.error("Inventory stock error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
