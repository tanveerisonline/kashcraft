import { PrismaClient, Review as PrismaReview } from '@prisma/client';
import { LoggerService } from '../logger/logger.service';

export interface CreateReviewInput {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  reviewId: string;
  rating?: number;
  comment?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ReviewService {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new LoggerService();
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    this.logger.info(`Creating review for product ${input.productId} by user ${input.userId}`);
    const newReview = await this.prisma.review.create({
      data: {
        productId: input.productId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment,
      },
    });
    return this.mapPrismaReviewToReview(newReview);
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    this.logger.info(`Fetching reviews for product ${productId}`);
    const prismaReviews = await this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return prismaReviews.map(this.mapPrismaReviewToReview);
  }

  async updateReview(input: UpdateReviewInput): Promise<Review> {
    this.logger.info(`Updating review ${input.reviewId}`);
    const updatedReview = await this.prisma.review.update({
      where: { id: input.reviewId },
      data: {
        rating: input.rating,
        comment: input.comment,
      },
    });
    return this.mapPrismaReviewToReview(updatedReview);
  }

  async deleteReview(reviewId: string): Promise<void> {
    this.logger.info(`Deleting review ${reviewId}`);
    await this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async moderateReview(reviewId: string, approved: boolean): Promise<Review> {
    this.logger.info(`Moderating review ${reviewId}, approved: ${approved}`);
    // In a real scenario, moderation might involve more complex logic,
    // such as setting a status field or moving to a different table.
    // For now, we'll just update the review (e.g., if there's an 'isApproved' field).
    const moderatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        // Assuming a field like 'isApproved' exists in your Prisma schema for moderation
        // isApproved: approved,
      },
    });
    return this.mapPrismaReviewToReview(moderatedReview);
  }

  private mapPrismaReviewToReview(prismaReview: PrismaReview): Review {
    return {
      id: prismaReview.id,
      productId: prismaReview.productId,
      userId: prismaReview.userId,
      rating: prismaReview.rating,
      comment: prismaReview.comment || undefined,
      createdAt: prismaReview.createdAt,
      updatedAt: prismaReview.updatedAt,
    };
  }
}
