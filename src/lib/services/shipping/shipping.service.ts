import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../logger/logger.service';

export interface ShippingRate {
  id: string;
  name: string;
  description?: string;
  price: number;
  minWeight?: number;
  maxWeight?: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShippingRateInput {
  name: string;
  description?: string;
  price: number;
  minWeight?: number;
  maxWeight?: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  isActive?: boolean;
}

export interface UpdateShippingRateInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  minWeight?: number;
  maxWeight?: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  isActive?: boolean;
}

export class ShippingService {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new LoggerService();
  }

  async createShippingRate(input: CreateShippingRateInput): Promise<ShippingRate> {
    this.logger.info(`Creating shipping rate: ${input.name}`);
    const newRate = await this.prisma.shippingRate.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        minWeight: input.minWeight,
        maxWeight: input.maxWeight,
        minOrderAmount: input.minOrderAmount,
        maxOrderAmount: input.maxOrderAmount,
        isActive: input.isActive ?? true,
      },
    });
    return this.mapPrismaShippingRateToShippingRate(newRate);
  }

  async getShippingRateById(id: string): Promise<ShippingRate | null> {
    this.logger.info(`Fetching shipping rate by ID: ${id}`);
    const rate = await this.prisma.shippingRate.findUnique({
      where: { id },
    });
    return rate ? this.mapPrismaShippingRateToShippingRate(rate) : null;
  }

  async getAllShippingRates(isActive?: boolean): Promise<ShippingRate[]> {
    this.logger.info(`Fetching all shipping rates (isActive: ${isActive})`);
    const rates = await this.prisma.shippingRate.findMany({
      where: isActive !== undefined ? { isActive } : {},
      orderBy: { name: 'asc' },
    });
    return rates.map(this.mapPrismaShippingRateToShippingRate);
  }

  async updateShippingRate(input: UpdateShippingRateInput): Promise<ShippingRate> {
    this.logger.info(`Updating shipping rate: ${input.id}`);
    const updatedRate = await this.prisma.shippingRate.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        minWeight: input.minWeight,
        maxWeight: input.maxWeight,
        minOrderAmount: input.minOrderAmount,
        maxOrderAmount: input.maxOrderAmount,
        isActive: input.isActive,
      },
    });
    return this.mapPrismaShippingRateToShippingRate(updatedRate);
  }

  async deleteShippingRate(id: string): Promise<void> {
    this.logger.info(`Deleting shipping rate: ${id}`);
    await this.prisma.shippingRate.delete({
      where: { id },
    });
  }

  private mapPrismaShippingRateToShippingRate(prismaShippingRate: any): ShippingRate {
    return {
      id: prismaShippingRate.id,
      name: prismaShippingRate.name,
      description: prismaShippingRate.description || undefined,
      price: prismaShippingRate.price.toNumber(),
      minWeight: prismaShippingRate.minWeight || undefined,
      maxWeight: prismaShippingRate.maxWeight || undefined,
      minOrderAmount: prismaShippingRate.minOrderAmount || undefined,
      maxOrderAmount: prismaShippingRate.maxOrderAmount || undefined,
      isActive: prismaShippingRate.isActive,
      createdAt: prismaShippingRate.createdAt,
      updatedAt: prismaShippingRate.updatedAt,
    };
  }
}
