import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../logger/logger.service';

export interface TaxRate {
  id: string;
  name: string;
  country: string;
  state?: string;
  city?: string;
  zipCode?: string;
  rate: number; // e.g., 0.05 for 5%
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaxRateInput {
  name: string;
  country: string;
  state?: string;
  city?: string;
  zipCode?: string;
  rate: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateTaxRateInput {
  id: string;
  name?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  rate?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export class TaxService {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new LoggerService();
  }

  async createTaxRate(input: CreateTaxRateInput): Promise<TaxRate> {
    this.logger.info(`Creating tax rate for ${input.country} - ${input.name}`);
    const newRate = await this.prisma.taxRate.create({
      data: {
        name: input.name,
        country: input.country,
        state: input.state,
        city: input.city,
        zipCode: input.zipCode,
        rate: input.rate,
        isDefault: input.isDefault ?? false,
        isActive: input.isActive ?? true,
      },
    });
    return this.mapPrismaTaxRateToTaxRate(newRate);
  }

  async getTaxRateById(id: string): Promise<TaxRate | null> {
    this.logger.info(`Fetching tax rate by ID: ${id}`);
    const rate = await this.prisma.taxRate.findUnique({
      where: { id },
    });
    return rate ? this.mapPrismaTaxRateToTaxRate(rate) : null;
  }

  async findApplicableTaxRate(country: string, state?: string, city?: string, zipCode?: string): Promise<TaxRate | null> {
    this.logger.info(`Finding applicable tax rate for country: ${country}, state: ${state}, city: ${city}, zipCode: ${zipCode}`);
    // This logic can be complex depending on tax rules (e.g., most specific match wins)
    // For simplicity, we'll try to find an exact match or a default for the country.
    const rate = await this.prisma.taxRate.findFirst({
      where: {
        country,
        state: state || null,
        city: city || null,
        zipCode: zipCode || null,
        isActive: true,
      },
      orderBy: { isDefault: 'desc' }, // Prioritize default rates if no specific match
    });
    return rate ? this.mapPrismaTaxRateToTaxRate(rate) : null;
  }

  async getAllTaxRates(isActive?: boolean): Promise<TaxRate[]> {
    this.logger.info(`Fetching all tax rates (isActive: ${isActive})`);
    const rates = await this.prisma.taxRate.findMany({
      where: isActive !== undefined ? { isActive } : {},
      orderBy: { country: 'asc' },
    });
    return rates.map(this.mapPrismaTaxRateToTaxRate);
  }

  async updateTaxRate(input: UpdateTaxRateInput): Promise<TaxRate> {
    this.logger.info(`Updating tax rate: ${input.id}`);
    const updatedRate = await this.prisma.taxRate.update({
      where: { id: input.id },
      data: {
        name: input.name,
        country: input.country,
        state: input.state,
        city: input.city,
        zipCode: input.zipCode,
        rate: input.rate,
        isDefault: input.isDefault,
        isActive: input.isActive,
      },
    });
    return this.mapPrismaTaxRateToTaxRate(updatedRate);
  }

  async deleteTaxRate(id: string): Promise<void> {
    this.logger.info(`Deleting tax rate: ${id}`);
    await this.prisma.taxRate.delete({
      where: { id },
    });
  }

  private mapPrismaTaxRateToTaxRate(prismaTaxRate: any): TaxRate {
    return {
      id: prismaTaxRate.id,
      name: prismaTaxRate.name,
      country: prismaTaxRate.country,
      state: prismaTaxRate.state || undefined,
      city: prismaTaxRate.city || undefined,
      zipCode: prismaTaxRate.zipCode || undefined,
      rate: prismaTaxRate.rate.toNumber(),
      isDefault: prismaTaxRate.isDefault,
      isActive: prismaTaxRate.isActive,
      createdAt: prismaTaxRate.createdAt,
      updatedAt: prismaTaxRate.updatedAt,
    };
  }
}
