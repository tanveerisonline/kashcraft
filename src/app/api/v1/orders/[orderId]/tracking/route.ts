import { orderTrackingService } from "@/lib/services/orders/order-tracking.service";

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const tracking = await orderTrackingService.getTrackingInfo(params.orderId);
    const history = await orderTrackingService.getTrackingHistory(params.orderId);

    if (!tracking) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ tracking, history });
  } catch (error) {
    console.error("Tracking error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
