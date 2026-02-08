/**
 * Order Tracking Service
 * Manages order status, shipment tracking, and notifications
 */

import { prisma } from "@/lib/db/prisma";
import { EventEmitter } from "events";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type TrackingEventType =
  | "order_confirmed"
  | "payment_received"
  | "order_processing"
  | "ready_for_shipment"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed"
  | "returned"
  | "returned_received";

export interface TrackingEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  type: TrackingEventType;
  timestamp: Date;
  location?: string;
  description: string;
  trackingNumber?: string;
}

export interface ShipmentInfo {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: Date;
  currentLocation: string;
  status: OrderStatus;
}

/**
 * Order tracking service
 */
export class OrderTrackingService extends EventEmitter {
  private static instance: OrderTrackingService;

  private constructor() {
    super();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): OrderTrackingService {
    if (!OrderTrackingService.instance) {
      OrderTrackingService.instance = new OrderTrackingService();
    }
    return OrderTrackingService.instance;
  }

  /**
   * Create or update order tracking
   */
  async createTracking(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery: Date
  ): Promise<ShipmentInfo> {
    try {
      const tracking = await prisma.orderTracking.create({
        data: {
          orderId,
          trackingNumber,
          carrier,
          estimatedDelivery,
          currentStatus: "shipped",
        },
      });

      // Log initial tracking event
      await this.addTrackingEvent(
        orderId,
        "shipped",
        "shipped",
        `Shipment created with ${carrier}`,
        trackingNumber
      );

      // Emit event for webhook/email notification
      this.emit("tracking-created", {
        orderId,
        trackingNumber,
        carrier,
        estimatedDelivery,
      });

      return {
        orderId,
        trackingNumber,
        carrier,
        estimatedDelivery,
        currentLocation: "Origin",
        status: "shipped",
      };
    } catch (error) {
      console.error("Error creating tracking:", error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    eventType: TrackingEventType,
    description: string,
    location?: string
  ): Promise<OrderStatus> {
    try {
      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });

      // Add tracking event
      const event = await this.addTrackingEvent(
        orderId,
        status,
        eventType,
        description,
        undefined,
        location
      );

      // Emit event for notifications
      this.emit("status-updated", {
        orderId,
        status,
        eventType,
        description,
        timestamp: event.timestamp,
      });

      // Send notification if customer is waiting
      this.notifyCustomer(orderId, status);

      return status;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  /**
   * Add tracking event
   */
  async addTrackingEvent(
    orderId: string,
    status: OrderStatus,
    type: TrackingEventType,
    description: string,
    trackingNumber?: string,
    location?: string
  ): Promise<TrackingEvent> {
    try {
      const event = await prisma.trackingEvent.create({
        data: {
          orderId,
          status,
          type,
          description,
          trackingNumber,
          location,
        },
      });

      return {
        id: event.id,
        orderId: event.orderId,
        status: event.status as OrderStatus,
        type: event.type as TrackingEventType,
        timestamp: event.timestamp,
        location: event.location || undefined,
        description: event.description,
        trackingNumber: event.trackingNumber || undefined,
      };
    } catch (error) {
      console.error("Error adding tracking event:", error);
      throw error;
    }
  }

  /**
   * Get full tracking history for order
   */
  async getTrackingHistory(orderId: string): Promise<TrackingEvent[]> {
    try {
      const events = await prisma.trackingEvent.findMany({
        where: { orderId },
        orderBy: { timestamp: "asc" },
      });

      return events.map((event) => ({
        id: event.id,
        orderId: event.orderId,
        status: event.status as OrderStatus,
        type: event.type as TrackingEventType,
        timestamp: event.timestamp,
        location: event.location || undefined,
        description: event.description,
        trackingNumber: event.trackingNumber || undefined,
      }));
    } catch (error) {
      console.error("Error getting tracking history:", error);
      throw error;
    }
  }

  /**
   * Get current tracking info
   */
  async getTrackingInfo(orderId: string): Promise<ShipmentInfo | null> {
    try {
      const tracking = await prisma.orderTracking.findUnique({
        where: { orderId },
      });

      if (!tracking) return null;

      // Get latest event for location
      const latestEvent = await prisma.trackingEvent.findFirst({
        where: { orderId },
        orderBy: { timestamp: "desc" },
      });

      return {
        orderId,
        trackingNumber: tracking.trackingNumber,
        carrier: tracking.carrier,
        estimatedDelivery: tracking.estimatedDelivery,
        currentLocation: latestEvent?.location || "In Transit",
        status: tracking.currentStatus as OrderStatus,
      };
    } catch (error) {
      console.error("Error getting tracking info:", error);
      throw error;
    }
  }

  /**
   * Get tracking info by tracking number
   */
  async getTrackingByNumber(trackingNumber: string): Promise<ShipmentInfo | null> {
    try {
      const tracking = await prisma.orderTracking.findFirst({
        where: { trackingNumber },
      });

      if (!tracking) return null;

      return this.getTrackingInfo(tracking.orderId);
    } catch (error) {
      console.error("Error getting tracking by number:", error);
      return null;
    }
  }

  /**
   * Update tracking from carrier API
   */
  async updateFromCarrier(
    trackingNumber: string,
    carrierStatus: string,
    location: string,
    estimatedDelivery: Date,
    description: string
  ): Promise<void> {
    try {
      const tracking = await prisma.orderTracking.findFirst({
        where: { trackingNumber },
      });

      if (!tracking) return;

      // Map carrier status to our status
      const status = this.mapCarrierStatus(carrierStatus);

      // Update tracking record
      await prisma.orderTracking.update({
        where: { orderId: tracking.orderId },
        data: {
          currentStatus: status,
          estimatedDelivery,
        },
      });

      // Add tracking event
      await this.addTrackingEvent(
        tracking.orderId,
        status,
        this.mapCarrierStatusToEvent(carrierStatus),
        description,
        trackingNumber,
        location
      );

      this.emit("carrier-update", {
        orderId: tracking.orderId,
        trackingNumber,
        status,
        location,
        description,
      });
    } catch (error) {
      console.error("Error updating tracking from carrier:", error);
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus, limit: number = 50) {
    try {
      return await prisma.order.findMany({
        where: { status },
        orderBy: { updatedAt: "desc" },
        take: limit,
        include: {
          user: { select: { email: true } },
          tracking: true,
        },
      });
    } catch (error) {
      console.error("Error getting orders by status:", error);
      throw error;
    }
  }

  /**
   * Get pending deliveries (next 7 days)
   */
  async getPendingDeliveries() {
    try {
      const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      return await prisma.orderTracking.findMany({
        where: {
          estimatedDelivery: {
            lte: sevenDaysLater,
          },
          currentStatus: { in: ["shipped", "in_transit", "out_for_delivery"] },
        },
        orderBy: { estimatedDelivery: "asc" },
        include: {
          order: {
            select: {
              id: true,
              user: { select: { email: true, phone: true } },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error getting pending deliveries:", error);
      throw error;
    }
  }

  /**
   * Get delivery metrics
   */
  async getDeliveryMetrics() {
    try {
      const orders = await prisma.order.findMany({
        where: {
          status: "delivered",
        },
      });

      const delivering = await prisma.order.count({
        where: {
          status: { in: ["shipped", "in_transit", "out_for_delivery"] },
        },
      });

      const delayed = await prisma.orderTracking.count({
        where: {
          AND: [{ estimatedDelivery: { lt: new Date() } }, { currentStatus: { not: "delivered" } }],
        },
      });

      // Calculate average delivery time
      const deliveredOrders = await prisma.order.findMany({
        where: { status: "delivered" },
        select: { createdAt: true, updatedAt: true },
      });

      const avgDeliveryTime =
        deliveredOrders.length > 0
          ? deliveredOrders.reduce((sum, order) => {
              return sum + (order.updatedAt.getTime() - order.createdAt.getTime());
            }, 0) /
            deliveredOrders.length /
            (1000 * 60 * 60 * 24)
          : 0;

      return {
        totalDelivered: orders.length,
        currentlyDelivering: delivering,
        delayedShipments: delayed,
        averageDeliveryDays: Math.round(avgDeliveryTime),
        deliveryOnTimePercentage:
          orders.length > 0 ? (((orders.length - delayed) / orders.length) * 100).toFixed(2) : "0",
      };
    } catch (error) {
      console.error("Error getting delivery metrics:", error);
      throw error;
    }
  }

  /**
   * Map carrier status codes to our status
   */
  private mapCarrierStatus(carrierStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      in_transit: "in_transit",
      out_for_delivery: "out_for_delivery",
      delivered: "delivered",
      failed: "delivery_failed",
      returned: "returned",
    };

    return statusMap[carrierStatus.toLowerCase()] || "in_transit";
  }

  /**
   * Map carrier status to tracking event type
   */
  private mapCarrierStatusToEvent(carrierStatus: string): TrackingEventType {
    const eventMap: Record<string, TrackingEventType> = {
      in_transit: "in_transit",
      out_for_delivery: "out_for_delivery",
      delivered: "delivered",
      failed: "delivery_failed",
      returned: "returned",
    };

    return eventMap[carrierStatus.toLowerCase()] || "in_transit";
  }

  /**
   * Notify customer of status change
   */
  private async notifyCustomer(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
      });

      if (!order) return;

      // Emit notification event (handled by email/SMS service)
      this.emit("notify-customer", {
        orderId,
        userId: order.userId,
        status,
        type: this.getNotificationType(status),
      });
    } catch (error) {
      console.error("Error notifying customer:", error);
    }
  }

  /**
   * Get notification type for status
   */
  private getNotificationType(status: OrderStatus): string {
    const types: Record<OrderStatus, string> = {
      pending: "order_confirmed",
      confirmed: "payment_received",
      processing: "processing",
      shipped: "shipped",
      in_transit: "in_transit",
      out_for_delivery: "out_for_delivery",
      delivered: "delivered",
      cancelled: "cancelled",
      returned: "returned",
    };

    return types[status] || "status_updated";
  }
}

// Export singleton instance
export const orderTrackingService = OrderTrackingService.getInstance();
