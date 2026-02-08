import { OrderRepository } from "@/lib/repositories/order.repository";
import { prismaMock } from "@/test/mocks/prisma";
import { orderFactory } from "@/test/factories";

describe("OrderRepository", () => {
  let orderRepository: OrderRepository;

  beforeEach(() => {
    orderRepository = new OrderRepository(prismaMock);
  });

  describe("create", () => {
    it("should create a new order", async () => {
      const orderData = {
        userId: "user-1",
        items: [{ productId: "prod-1", quantity: 2, price: 99.99 }],
        subtotal: 199.98,
        tax: 20,
        shipping: 10,
        total: 229.98,
        status: "PENDING",
      };

      const createdOrder = orderFactory.create(orderData);
      prismaMock.order.create.mockResolvedValue(createdOrder as any);

      const result = await orderRepository.create(orderData as any);

      expect(result).toEqual(createdOrder);
      expect(prismaMock.order.create).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return order if found", async () => {
      const order = orderFactory.create();
      prismaMock.order.findUnique.mockResolvedValue(order as any);

      const result = await orderRepository.findById(order.id);

      expect(result).toEqual(order);
      expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
        where: { id: order.id },
        include: { items: true },
      });
    });

    it("should return null if order not found", async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      const result = await orderRepository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return paginated user orders", async () => {
      const userId = "user-1";
      const orders = orderFactory.createMany(3, { userId });
      prismaMock.order.findMany.mockResolvedValue(orders as any);
      prismaMock.order.count.mockResolvedValue(10);

      const result = await orderRepository.findByUserId(userId, { skip: 0, take: 3 });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(10);
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          skip: 0,
          take: 3,
        })
      );
    });

    it("should filter orders by status", async () => {
      const userId = "user-1";
      const orders = orderFactory.createMany(2, { userId, status: "DELIVERED" });
      prismaMock.order.findMany.mockResolvedValue(orders as any);
      prismaMock.order.count.mockResolvedValue(2);

      const result = await orderRepository.findByUserId(userId, {
        where: { status: "DELIVERED" },
      });

      expect(result.data).toHaveLength(2);
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            status: "DELIVERED",
          }),
        })
      );
    });

    it("should sort orders by date descending by default", async () => {
      const userId = "user-1";
      const orders = orderFactory.createMany(3, { userId });
      prismaMock.order.findMany.mockResolvedValue(orders as any);
      prismaMock.order.count.mockResolvedValue(3);

      await orderRepository.findByUserId(userId);

      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        })
      );
    });
  });

  describe("update", () => {
    it("should update order status", async () => {
      const orderId = "order-1";
      const updatedOrder = orderFactory.create({ status: "SHIPPED" });
      prismaMock.order.update.mockResolvedValue(updatedOrder as any);

      const result = await orderRepository.update(orderId, { status: "SHIPPED" });

      expect(result.status).toBe("SHIPPED");
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: "SHIPPED" },
      });
    });

    it("should update multiple fields", async () => {
      const orderId = "order-1";
      const updateData = {
        status: "DELIVERED",
        paymentStatus: "COMPLETED",
      };
      const updatedOrder = orderFactory.create(updateData);
      prismaMock.order.update.mockResolvedValue(updatedOrder as any);

      const result = await orderRepository.update(orderId, updateData);

      expect(result.status).toBe("DELIVERED");
      expect(result.paymentStatus).toBe("COMPLETED");
    });
  });

  describe("findByOrderNumber", () => {
    it("should find order by order number", async () => {
      const order = orderFactory.create();
      prismaMock.order.findUnique.mockResolvedValue(order as any);

      const result = await orderRepository.findByOrderNumber(order.orderNumber);

      expect(result).toEqual(order);
      expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
        where: { orderNumber: order.orderNumber },
        include: { items: true },
      });
    });
  });

  describe("countByUserId", () => {
    it("should count orders for user", async () => {
      const userId = "user-1";
      prismaMock.order.count.mockResolvedValue(5);

      const result = await orderRepository.countByUserId(userId);

      expect(result).toBe(5);
      expect(prismaMock.order.count).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe("getTotalRevenue", () => {
    it("should calculate total revenue", async () => {
      prismaMock.order.aggregate.mockResolvedValue({
        _sum: { total: 10000 },
      } as any);

      const result = await orderRepository.getTotalRevenue();

      expect(result).toBe(10000);
      expect(prismaMock.order.aggregate).toHaveBeenCalledWith({
        _sum: { total: true },
        where: { status: "COMPLETED" },
      });
    });
  });

  describe("getAverageOrderValue", () => {
    it("should calculate average order value", async () => {
      prismaMock.order.aggregate.mockResolvedValue({
        _avg: { total: 250 },
      } as any);

      const result = await orderRepository.getAverageOrderValue();

      expect(result).toBe(250);
      expect(prismaMock.order.aggregate).toHaveBeenCalledWith({
        _avg: { total: true },
        where: { status: "COMPLETED" },
      });
    });
  });
});
