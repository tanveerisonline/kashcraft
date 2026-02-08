import { PrismaClient } from "@prisma/client";
import { LoggerService } from "../logger/logger.service";

export interface DashboardMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  productsViewed: number;
  itemsAddedToCart: number;
  totalPurchases: number;
  totalRevenue: number;
}

export class AnalyticsService {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new LoggerService();
  }

  async trackPageView(path: string, userId?: string): Promise<void> {
    this.logger.info(`Page view tracked: Path=${path}, UserId=${userId || "anonymous"}`);
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: "page_view",
        path,
        userId,
      },
    });
  }

  async trackProductView(productId: string, userId?: string): Promise<void> {
    this.logger.info(
      `Product view tracked: ProductId=${productId}, UserId=${userId || "anonymous"}`
    );
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: "product_view",
        productId,
        userId,
      },
    });
  }

  async trackAddToCart(productId: string, userId?: string): Promise<void> {
    this.logger.info(
      `Add to cart tracked: ProductId=${productId}, UserId=${userId || "anonymous"}`
    );
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: "add_to_cart",
        productId,
        userId,
      },
    });
  }

  async trackPurchase(orderId: string, userId: string, revenue: number): Promise<void> {
    this.logger.info(`Purchase tracked: OrderId=${orderId}, UserId=${userId}, Revenue=${revenue}`);
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: "purchase",
        orderId,
        userId,
        revenue,
      },
    });
  }

  async getDashboardMetrics(startDate: Date, endDate: Date): Promise<DashboardMetrics> {
    this.logger.info(
      `Fetching dashboard metrics from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalPageViews = events.filter((e) => e.eventType === "page_view").length;
    const uniqueVisitors = new Set(events.map((e) => e.userId)).size;
    const productsViewed = events.filter((e) => e.eventType === "product_view").length;
    const itemsAddedToCart = events.filter((e) => e.eventType === "add_to_cart").length;
    const totalPurchases = events.filter((e) => e.eventType === "purchase").length;
    const totalRevenue = events
      .filter((e) => e.eventType === "purchase" && e.revenue !== null)
      .reduce((sum, e) => sum + (e.revenue?.toNumber() || 0), 0);

    return {
      totalPageViews,
      uniqueVisitors,
      productsViewed,
      itemsAddedToCart,
      totalPurchases,
      totalRevenue,
    };
  }
}
