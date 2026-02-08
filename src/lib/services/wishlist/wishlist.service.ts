import { PrismaClient, Wishlist as PrismaWishlist } from '@prisma/client';
import { LoggerService } from '../logger/logger.service';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WishlistService {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new LoggerService();
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    this.logger.info(`Adding product ${productId} to wishlist for user ${userId}`);
    const wishlistItem = await this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });
    return this.mapPrismaWishlistToWishlistItem(wishlistItem);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    this.logger.info(`Removing product ${productId} from wishlist for user ${userId}`);
    await this.prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    this.logger.info(`Fetching wishlist for user ${userId}`);
    const prismaWishlistItems = await this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return prismaWishlistItems.map(this.mapPrismaWishlistToWishlistItem);
  }

  async checkInWishlist(userId: string, productId: string): Promise<boolean> {
    this.logger.info(`Checking if product ${productId} is in wishlist for user ${userId}`);
    const count = await this.prisma.wishlist.count({
      where: {
        userId,
        productId,
      },
    });
    return count > 0;
  }

  async moveToCart(userId: string, productId: string): Promise<void> {
    this.logger.info(`Moving product ${productId} from wishlist to cart for user ${userId}`);
    // This would typically involve interacting with the CartService to add the item to the cart
    // and then removing it from the wishlist.
    // For now, we'll just remove it from the wishlist as a placeholder.
    await this.removeFromWishlist(userId, productId);
    // await this.cartService.addItem(userId, productId, 1); // Example of CartService interaction
  }

  private mapPrismaWishlistToWishlistItem(prismaWishlist: PrismaWishlist): WishlistItem {
    return {
      id: prismaWishlist.id,
      userId: prismaWishlist.userId,
      productId: prismaWishlist.productId,
      createdAt: prismaWishlist.createdAt,
      updatedAt: prismaWishlist.updatedAt,
    };
  }
}
