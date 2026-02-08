import { PrismaClient } from "@prisma/client";
import { LoggerService } from "../logger/logger.service";

export interface SalesReportInput {
  startDate: Date;
  endDate: Date;
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export interface UserReportInput {
  startDate: Date;
  endDate: Date;
}

export interface UserReport {
  totalNewUsers: number;
  totalActiveUsers: number;
  topUsersByOrders: { userId: string; userName: string; orderCount: number; totalSpent: number }[];
}

export class ReportService {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new LoggerService();
  }

  async generateSalesReport(input: SalesReportInput): Promise<SalesReport> {
    this.logger.info(
      `Generating sales report from ${input.startDate.toISOString()} to ${input.endDate.toISOString()}`
    );

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: input.startDate,
          lte: input.endDate,
        },
        status: {
          in: ["DELIVERED", "CONFIRMED", "SHIPPED"], // Consider these as completed sales
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total.toNumber(), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productSales: {
      [productId: string]: {
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: number;
      };
    } = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            productName: item.product.name,
            quantitySold: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantitySold += item.quantity;
        productSales[item.productId].revenue += item.quantity * item.price.toNumber();
      });
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10); // Top 10 products

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topSellingProducts,
    };
  }

  async generateUserReport(input: UserReportInput): Promise<UserReport> {
    this.logger.info(
      `Generating user report from ${input.startDate.toISOString()} to ${input.endDate.toISOString()}`
    );

    const newUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: input.startDate,
          lte: input.endDate,
        },
      },
    });

    const activeUsers = await this.prisma.user.count({
      where: {
        isActive: true,
        // More complex logic for active users (e.g., logged in within period, made a purchase)
      },
    });

    const usersWithOrders = await this.prisma.user.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: input.startDate,
              lte: input.endDate,
            },
          },
        },
      },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: input.startDate,
              lte: input.endDate,
            },
          },
          include: {
            items: true,
          },
        },
      },
    });

    const topUsersByOrders = usersWithOrders
      .map((user) => {
        const orderCount = user.orders.length;
        const totalSpent = user.orders.reduce((sum, order) => sum + order.total.toNumber(), 0);
        return {
          userId: user.id,
          userName: user.name || user.email,
          orderCount,
          totalSpent,
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10); // Top 10 users by order count

    return {
      totalNewUsers: newUsers,
      totalActiveUsers: activeUsers,
      topUsersByOrders,
    };
  }
}
