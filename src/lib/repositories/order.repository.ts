import { PrismaClient, Order, OrderStatus, Prisma } from '@prisma/client'
import { BaseRepository, QueryOptions } from './base.repository'

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
}

type OrderWithTotalAmount = {
  totalAmount: Prisma.Decimal;
};

export class OrderRepository extends BaseRepository<Order> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Order')
  }

  async findByUser(userId: string, options?: QueryOptions): Promise<Order[]> {
    return this.model.findMany({
      where: { userId },
      ...options,
    })
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.model.findUnique({ where: { orderNumber } })
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.model.update({
      where: { id: orderId },
      data: { status },
    })
  }

  async getOrderStats(startDate: Date, endDate: Date): Promise<OrderStats> {
    const orders: OrderWithTotalAmount[] = await this.model.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'CANCELLED', // Exclude cancelled orders from stats
        },
      },
      select: {
        totalAmount: true,
      },
    })

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum: number, order: OrderWithTotalAmount) => sum + order.totalAmount.toNumber(), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
    }
  }

  async findPendingOrders(): Promise<Order[]> {
    return this.model.findMany({
      where: {
        status: 'PENDING',
      },
    })
  }
}
