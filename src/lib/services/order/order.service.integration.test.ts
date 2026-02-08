import { describe, it, expect, beforeEach, vi } from "@jest/globals";
import { OrderService } from "@/lib/services/order/order.service";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { ProductService } from "@/lib/services/product/product.service";
import { PaymentGatewayFactory } from "@/lib/services/payment/payment.factory";
import { AppError } from "@/lib/middleware/app-error";

const mockOrderRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  updateStatus: vi.fn(),
  findByUser: vi.fn(),
} as unknown as OrderRepository;

const mockProductService = {
  checkAndUpdateStock: vi.fn(),
} as unknown as ProductService;

const mockPaymentFactory = {
  createPaymentGateway: vi.fn(),
} as unknown as PaymentGatewayFactory;

const mockEmailService = {
  sendEmail: vi.fn(),
} as unknown as any;

describe("OrderService Integration Tests", () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService(
      mockOrderRepo,
      mockProductService,
      mockPaymentFactory,
      mockEmailService
    );
    vi.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create order with valid items", async () => {
      const mockOrder = { id: "order-1", userId: "user-1", status: "PENDING" };
      vi.mocked(mockProductService.checkAndUpdateStock).mockResolvedValue(true);
      vi.mocked(mockOrderRepo.create).mockResolvedValue(mockOrder as any);

      const items = [
        {
          productId: "prod-1",
          quantity: 2,
          price: 100,
        },
      ];

      const result = await orderService.createOrder("user-1", items, {
        street: "123 Main",
        city: "NYC",
        state: "NY",
        zip: "10001",
        country: "USA",
      });

      expect(result).toEqual(mockOrder);
      expect(mockProductService.checkAndUpdateStock).toHaveBeenCalledWith("prod-1", -2);
      expect(mockOrderRepo.create).toHaveBeenCalled();
    });

    it("should throw error if insufficient stock", async () => {
      vi.mocked(mockProductService.checkAndUpdateStock).mockResolvedValue(false);

      const items = [{ productId: "prod-1", quantity: 100, price: 100 }];

      expect(
        orderService.createOrder("user-1", items, {
          street: "123 Main",
          city: "NYC",
          state: "NY",
          zip: "10001",
          country: "USA",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("getOrderById", () => {
    it("should return order if found", async () => {
      const mockOrder = { id: "order-1", userId: "user-1", status: "PENDING" };
      vi.mocked(mockOrderRepo.findById).mockResolvedValue(mockOrder as any);

      const result = await orderService.getOrderById("order-1");

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepo.findById).toHaveBeenCalledWith("order-1");
    });

    it("should throw AppError if order not found", async () => {
      vi.mocked(mockOrderRepo.findById).mockResolvedValue(null);

      expect(orderService.getOrderById("nonexistent")).rejects.toThrow(AppError);
    });
  });

  describe("cancelOrder", () => {
    it("should cancel pending order", async () => {
      const mockOrder = { id: "order-1", userId: "user-1", status: "PENDING" };
      const cancelledOrder = { ...mockOrder, status: "CANCELLED" };

      vi.mocked(mockOrderRepo.findById).mockResolvedValue(mockOrder as any);
      vi.mocked(mockOrderRepo.updateStatus).mockResolvedValue(cancelledOrder as any);

      const result = await orderService.cancelOrder("order-1", "Changed my mind");

      expect(result.status).toBe("CANCELLED");
      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith("order-1", "CANCELLED");
    });

    it("should throw error if order cannot be cancelled", async () => {
      const mockOrder = { id: "order-1", userId: "user-1", status: "SHIPPED" };
      vi.mocked(mockOrderRepo.findById).mockResolvedValue(mockOrder as any);

      expect(orderService.cancelOrder("order-1", "test")).rejects.toThrow(AppError);
    });
  });

  describe("getUserOrders", () => {
    it("should return paginated orders", async () => {
      const mockOrders = [
        { id: "order-1", userId: "user-1", status: "PENDING" },
        { id: "order-2", userId: "user-1", status: "PROCESSING" },
      ];

      vi.mocked(mockOrderRepo.findByUser).mockResolvedValue(mockOrders as any);
      vi.mocked(mockOrderRepo.count).mockResolvedValue(2);

      const result = await orderService.getUserOrders("user-1", 1, 10);

      expect(result.data).toEqual(mockOrders);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });
});
