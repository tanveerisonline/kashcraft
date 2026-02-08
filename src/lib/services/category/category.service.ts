import { PrismaClient, Category as PrismaCategory } from "@prisma/client";
import { LoggerService } from "../logger/logger.service";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export class CategoryService {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new LoggerService();
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    this.logger.info(`Creating category: ${input.name}`);
    const newCategory = await this.prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        imageUrl: input.imageUrl,
        parentId: input.parentId,
      },
    });
    return this.mapPrismaCategoryToCategory(newCategory);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    this.logger.info(`Fetching category by ID: ${id}`);
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    return category ? this.mapPrismaCategoryToCategory(category) : null;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    this.logger.info(`Fetching category by slug: ${slug}`);
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });
    return category ? this.mapPrismaCategoryToCategory(category) : null;
  }

  async getAllCategories(): Promise<Category[]> {
    this.logger.info(`Fetching all categories`);
    const categories = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories.map(this.mapPrismaCategoryToCategory);
  }

  async getChildCategories(parentId: string): Promise<Category[]> {
    this.logger.info(`Fetching child categories for parent ID: ${parentId}`);
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      orderBy: { name: "asc" },
    });
    return categories.map(this.mapPrismaCategoryToCategory);
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    this.logger.info(`Updating category: ${input.id}`);
    const updatedCategory = await this.prisma.category.update({
      where: { id: input.id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        imageUrl: input.imageUrl,
        parentId: input.parentId,
      },
    });
    return this.mapPrismaCategoryToCategory(updatedCategory);
  }

  async deleteCategory(id: string): Promise<void> {
    this.logger.info(`Deleting category: ${id}`);
    await this.prisma.category.delete({
      where: { id },
    });
  }

  private mapPrismaCategoryToCategory(prismaCategory: PrismaCategory): Category {
    return {
      id: prismaCategory.id,
      name: prismaCategory.name,
      slug: prismaCategory.slug,
      description: prismaCategory.description || undefined,
      imageUrl: prismaCategory.imageUrl || undefined,
      parentId: prismaCategory.parentId || undefined,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    };
  }
}
