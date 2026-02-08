import { realTimeInventoryService } from "@/lib/services/inventory/real-time-inventory.service";

export async function GET() {
  try {
    const lowStock = await realTimeInventoryService.getLowStockProducts();
    return Response.json({ products: lowStock });
  } catch (error) {
    console.error("Low stock error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
