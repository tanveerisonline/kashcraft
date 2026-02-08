import { realTimeInventoryService } from "@/lib/services/inventory/real-time-inventory.service";

export async function GET() {
  try {
    const metrics = await realTimeInventoryService.getInventoryMetrics();
    return Response.json(metrics);
  } catch (error) {
    console.error("Inventory metrics error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
