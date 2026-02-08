import { PrismaClient, Category } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class CategoryRepository extends BaseRepository<Category> {
  constructor(prisma: PrismaClient) {
    super(prisma, "Category");
  }
}
