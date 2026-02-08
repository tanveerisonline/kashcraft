import { orderTrackingService } from "@/lib/services/orders/order-tracking.service";

export async function GET(request: Request, { params }: { params: { trackingNumber: string } }) {
  try {
    const tracking = await orderTrackingService.getTrackingByNumber(params.trackingNumber);

    if (!tracking) {
      return Response.json({ error: "Tracking information not found" }, { status: 404 });
    }

    // Return limited public info
    return Response.json({
      tracking: {
        trackingNumber: tracking.trackingNumber,
        carrier: tracking.carrier,
        currentStatus: tracking.currentStatus,
        estimatedDelivery: tracking.estimatedDelivery,
        lastUpdated: tracking.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Public tracking error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
