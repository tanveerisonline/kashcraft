import { PrismaClient, User } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  // Add other updatable profile fields as needed
}

export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma, "User");
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    try {
      await this.model.update({
        where: { id: userId },
        data: { passwordHash },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyEmail(userId: string): Promise<boolean> {
    try {
      await this.model.update({
        where: { id: userId },
        data: { emailVerified: true },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<User> {
    return this.model.update({
      where: { id: userId },
      data,
    });
  }
}
