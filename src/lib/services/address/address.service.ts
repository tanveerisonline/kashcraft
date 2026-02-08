import { PrismaClient, Address as PrismaAddress } from "@prisma/client";
import { LoggerService } from "../logger/logger.service";

export interface Address {
  id: string;
  userId: string;
  type: string; // e.g., "shipping", "billing"
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressInput {
  userId: string;
  type?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  id: string;
  type?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export class AddressService {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new LoggerService();
  }

  async createAddress(input: CreateAddressInput): Promise<Address> {
    this.logger.info(`Creating address for user ${input.userId}`);
    const newAddress = await this.prisma.address.create({
      data: {
        userId: input.userId,
        type: input.type ?? "shipping",
        street: input.street,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        isDefault: input.isDefault ?? false,
      },
    });
    return this.mapPrismaAddressToAddress(newAddress);
  }

  async getAddressById(id: string): Promise<Address | null> {
    this.logger.info(`Fetching address by ID: ${id}`);
    const address = await this.prisma.address.findUnique({
      where: { id },
    });
    return address ? this.mapPrismaAddressToAddress(address) : null;
  }

  async getUserAddresses(userId: string, type?: string): Promise<Address[]> {
    this.logger.info(`Fetching addresses for user ${userId} (type: ${type})`);
    const addresses = await this.prisma.address.findMany({
      where: {
        userId,
        type: type || undefined,
      },
      orderBy: { createdAt: "desc" },
    });
    return addresses.map(this.mapPrismaAddressToAddress);
  }

  async updateAddress(input: UpdateAddressInput): Promise<Address> {
    this.logger.info(`Updating address: ${input.id}`);
    const updatedAddress = await this.prisma.address.update({
      where: { id: input.id },
      data: {
        type: input.type,
        street: input.street,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        isDefault: input.isDefault,
      },
    });
    return this.mapPrismaAddressToAddress(updatedAddress);
  }

  async deleteAddress(id: string): Promise<void> {
    this.logger.info(`Deleting address: ${id}`);
    await this.prisma.address.delete({
      where: { id },
    });
  }

  async setDefaultAddress(
    userId: string,
    addressId: string,
    type: string = "shipping"
  ): Promise<void> {
    this.logger.info(`Setting default address ${addressId} for user ${userId} (type: ${type})`);
    // First, unset current default for the given type
    await this.prisma.address.updateMany({
      where: {
        userId,
        type,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
    // Then, set the new default
    await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  private mapPrismaAddressToAddress(prismaAddress: PrismaAddress): Address {
    return {
      id: prismaAddress.id,
      userId: prismaAddress.userId,
      type: prismaAddress.type,
      street: prismaAddress.street,
      city: prismaAddress.city,
      state: prismaAddress.state,
      zipCode: prismaAddress.zipCode,
      country: prismaAddress.country,
      isDefault: prismaAddress.isDefault,
      createdAt: prismaAddress.createdAt,
      updatedAt: prismaAddress.updatedAt,
    };
  }
}
