import { Order, OrderStatus } from "@prisma/client";
import { OrderRepository } from "../../repositories/order.repository";
import { ProductService, PaginatedResult } from "../product/product.service";
import { PaymentGatewayFactory } from "../payment/payment.factory";
import { PaymentProvider, PaymentResult } from "../payment/payment.interface";
import { IEmailService, EmailContent } from "../email/email.interface";
import { AnalyticsService } from "../analytics/analytics.service";
import { AppError } from "../../middleware/app-error";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const analyticsService = new AnalyticsService(prisma);

// Placeholder interfaces - these would typically be defined in a shared types file or their respective modules
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private productService: ProductService,
    private paymentFactory: PaymentGatewayFactory,
    private emailService: IEmailService
  ) {}

  async createOrder(userId: string, items: OrderItem[], shippingAddress: Address): Promise<Order> {
    // 1. Validate product availability and deduct stock
    for (const item of items) {
      const stockUpdated = await this.productService.checkAndUpdateStock(
        item.productId,
        -item.quantity
      );
      if (!stockUpdated) {
        throw new AppError(
          400,
          `Not enough stock for product ${item.productId}`,
          "INSUFFICIENT_STOCK",
          true
        );
      }
    }

    // 2. Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 3. Create order in database
    const order = await this.orderRepo.create({
      userId,
      status: OrderStatus.PENDING,
      totalAmount,
      shippingAddress: JSON.stringify(shippingAddress), // Store as JSON for simplicity
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    });

    // 4. Send order confirmation email
    await this.emailService.sendEmail({
      to: "user@example.com", // Get user email from userId
      subject: "Order Confirmation",
      body: `Your order #${order.orderNumber} has been placed.`,
    });

    return order;
  }

  async processPayment(orderId: string, paymentMethod: PaymentProvider): Promise<PaymentResult> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError(404, "Order not found", "ORDER_NOT_FOUND", true);
    }

    const paymentGateway = this.paymentFactory.createPaymentGateway(paymentMethod);
    const paymentResult = await paymentGateway.processPayment(order.id, order.total.toNumber());

    if (paymentResult.success) {
      await this.orderRepo.updateStatus(order.id, OrderStatus.PROCESSING);
      await analyticsService.trackPurchase(order.id, order.userId, order.total.toNumber());
      // Send payment confirmation email
    } else {
      await this.orderRepo.updateStatus(order.id, OrderStatus.PAYMENT_FAILED);
      // Send payment failure email
    }

    return paymentResult;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const updatedOrder = await this.orderRepo.updateStatus(orderId, status);
    // Send status update email
    return updatedOrder;
  }

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError(404, "Order not found", "ORDER_NOT_FOUND", true);
    }
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new AppError(
        400,
        "Order cannot be cancelled at this stage",
        "ORDER_CANNOT_CANCEL",
        true
      );
    }

    // Refund payment if already processed (logic to be added)

    // Restore stock
    // const orderItems = await this.orderRepo.getOrderItems(orderId); // Assuming a method to get order items
    // for (const item of orderItems) {
    //   await this.productService.checkAndUpdateStock(item.productId, item.quantity);
    // }

    const cancelledOrder = await this.orderRepo.updateStatus(orderId, OrderStatus.CANCELLED);
    // Send cancellation email
    return cancelledOrder;
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Order>> {
    const skip = (page - 1) * limit;
    const orders = await this.orderRepo.findByUser(userId, { skip, take: limit });
    const total = await this.orderRepo.count({ where: { userId } });

    return {
      data: orders,
      total,
      page,
      limit,
    };
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError(404, "Order not found", "ORDER_NOT_FOUND", true);
    }
    return order;
  }
}
