import { OrderService } from "@/lib/services/order/order.service";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { CouponRepository } from "@/lib/repositories/coupon.repository";
import { orderFactory, couponFactory, productFactory } from "@/test/factories";

describe("OrderService", () => {
  let orderService: OrderService;
  let mockOrderRepo: jest.Mocked<OrderRepository>;
  let mockProductRepo: jest.Mocked<ProductRepository>;
  let mockCouponRepo: jest.Mocked<CouponRepository>;

  beforeEach(() => {
    mockOrderRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<OrderRepository>;

    mockProductRepo = {
      findById: jest.fn(),
      updateStock: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>;

    mockCouponRepo = {
      findByCode: jest.fn(),
      incrementUsage: jest.fn(),
    } as unknown as jest.Mocked<CouponRepository>;

    orderService = new OrderService(mockOrderRepo, mockProductRepo, mockCouponRepo);
  });

  describe("createOrder", () => {
    it("should create order successfully", async () => {
      const orderData = {
        userId: "user-1",
        items: [
          { productId: "prod-1", quantity: 2, price: 99.99 },
          { productId: "prod-2", quantity: 1, price: 49.99 },
        ],
        shippingAddress: {
          name: "John Doe",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
        },
        paymentMethod: "CARD",
      };

      const createdOrder = orderFactory.create(orderData);
      mockOrderRepo.create.mockResolvedValue(createdOrder);

      const result = await orderService.createOrder(orderData);

      expect(result).toEqual(createdOrder);
      expect(mockOrderRepo.create).toHaveBeenCalledWith(expect.objectContaining(orderData));
    });

    it("should update product stock when creating order", async () => {
      const orderData = {
        userId: "user-1",
        items: [{ productId: "prod-1", quantity: 2 }],
        shippingAddress: {
          name: "John Doe",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
        },
      };

      const createdOrder = orderFactory.create();
      mockOrderRepo.create.mockResolvedValue(createdOrder);
      mockProductRepo.updateStock.mockResolvedValue(true);

      await orderService.createOrder(orderData);

      expect(mockProductRepo.updateStock).toHaveBeenCalledWith("prod-1", -2);
    });

    it("should apply coupon if provided", async () => {
      const coupon = couponFactory.percentage(10);
      const orderData = {
        userId: "user-1",
        items: [{ productId: "prod-1", quantity: 1, price: 100 }],
        couponCode: coupon.code,
      };

      mockCouponRepo.findByCode.mockResolvedValue(coupon);
      mockCouponRepo.incrementUsage.mockResolvedValue(true);
      const createdOrder = orderFactory.create({
        discountCode: coupon.code,
        discountAmount: 10, // 10% of 100
      });
      mockOrderRepo.create.mockResolvedValue(createdOrder);

      const result = await orderService.createOrder(orderData);

      expect(result.discountAmount).toBe(10);
      expect(mockCouponRepo.incrementUsage).toHaveBeenCalledWith(coupon.id);
    });

    it("should fail if coupon is expired", async () => {
      const expiredCoupon = couponFactory.create({
        expiresAt: new Date(Date.now() - 1000), // Past date
      });

      const orderData = {
        couponCode: expiredCoupon.code,
      };

      mockCouponRepo.findByCode.mockResolvedValue(expiredCoupon);

      await expect(orderService.createOrder(orderData as any)).rejects.toThrow("Coupon expired");
    });

    it("should fail if coupon usage limit exceeded", async () => {
      const coupon = couponFactory.create({ maxUses: 5, used: 5 });
      const orderData = { couponCode: coupon.code };

      mockCouponRepo.findByCode.mockResolvedValue(coupon);

      await expect(orderService.createOrder(orderData as any)).rejects.toThrow(
        "Coupon usage limit exceeded"
      );
    });
  });

  describe("getOrderById", () => {
    it("should return order if found", async () => {
      const order = orderFactory.create();
      mockOrderRepo.findById.mockResolvedValue(order);

      const result = await orderService.getOrderById(order.id);

      expect(result).toEqual(order);
    });

    it("should return null if order not found", async () => {
      mockOrderRepo.findById.mockResolvedValue(null);

      const result = await orderService.getOrderById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getUserOrders", () => {
    it("should return user orders with pagination", async () => {
      const userId = "user-1";
      const orders = orderFactory.createMany(3, { userId });

      mockOrderRepo.findByUserId.mockResolvedValue({
        data: orders,
        total: 10,
        page: 1,
        limit: 3,
      });

      const result = await orderService.getUserOrders(userId, { page: 1, limit: 3 });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(10);
      expect(mockOrderRepo.findByUserId).toHaveBeenCalledWith(userId, expect.any(Object));
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status successfully", async () => {
      const orderId = "order-1";
      const updatedOrder = orderFactory.create({ status: "SHIPPED" });
      mockOrderRepo.update.mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrderStatus(orderId, "SHIPPED");

      expect(result.status).toBe("SHIPPED");
      expect(mockOrderRepo.update).toHaveBeenCalledWith(orderId, { status: "SHIPPED" });
    });
  });

  describe("cancelOrder", () => {
    it("should cancel order and restore product stock", async () => {
      const order = orderFactory.create({ status: "PENDING" });
      const cancelledOrder = orderFactory.create({ id: order.id, status: "CANCELLED" });

      mockOrderRepo.findById.mockResolvedValue(order);
      mockOrderRepo.update.mockResolvedValue(cancelledOrder);
      mockProductRepo.updateStock.mockResolvedValue(true);

      const result = await orderService.cancelOrder(order.id);

      expect(result.status).toBe("CANCELLED");
      // Restore stock for each item
      expect(mockProductRepo.updateStock).toHaveBeenCalled();
    });

    it("should not cancel delivered orders", async () => {
      const deliveredOrder = orderFactory.delivered();
      mockOrderRepo.findById.mockResolvedValue(deliveredOrder);

      await expect(orderService.cancelOrder(deliveredOrder.id)).rejects.toThrow(
        "Cannot cancel delivered order"
      );
    });
  });

  describe("calculateOrderTotal", () => {
    it("should calculate total without discount", () => {
      const subtotal = 100;
      const tax = 10;
      const shipping = 5;

      const total = orderService.calculateOrderTotal(subtotal, tax, shipping);

      expect(total).toBe(115);
    });

    it("should calculate total with percentage discount", () => {
      const subtotal = 100;
      const tax = 10;
      const shipping = 5;
      const discountAmount = 10; // 10% discount

      const total = orderService.calculateOrderTotal(subtotal, tax, shipping, discountAmount);

      expect(total).toBe(105);
    });
  });
});
