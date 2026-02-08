// src/lib/services/auth/auth.service.ts

import { User } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../../db/prisma";
import crypto from "crypto";

// Placeholder types - these will need to be defined based on your application's data models
interface RegisterInput {
  email: string;
  password: string;
  // Add other registration fields as needed
}

export class AuthService {
  async registerUser(data: RegisterInput): Promise<User> {
    const registerSchema = z.object({
      email: z.string().email("Invalid email address."),
      password: z.string().min(6, "Password must be at least 6 characters long."),
    });

    const validatedFields = registerSchema.safeParse(data);

    if (!validatedFields.success) {
      throw new Error("Invalid registration data.");
    }

    const { email, password } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });

    return newUser;
  }

  async verifyEmail(token: string): Promise<boolean> {
    if (!token) {
      throw new Error("Verification token is missing.");
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      throw new Error("Invalid or expired verification token.");
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token: verificationToken.token },
      });
      throw new Error("Verification token has expired.");
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: true },
    });

    await prisma.verificationToken.delete({
      where: { token: verificationToken.token },
    });

    return true;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const emailSchema = z.string().email("Invalid email address.");
    const validatedEmail = emailSchema.safeParse(email);

    if (!validatedEmail.success) {
      throw new Error("Invalid email format.");
    }

    const user = await prisma.user.findUnique({
      where: { email: validatedEmail.data },
    });

    if (!user) {
      // For security reasons, do not reveal if the user does not exist
      console.warn(`Password reset requested for non-existent email: ${validatedEmail.data}`);
      return;
    }

    // Invalidate any existing password reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email, token: { startsWith: "reset_" } }, // Assuming reset tokens start with "reset_"
    });

    const token = `reset_${crypto.randomBytes(32).toString("hex")}`;
    const expires = new Date(Date.now() + 3600 * 1000); // Token valid for 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    // TODO: Send password reset email with the token
    console.log(`Password reset token generated for ${user.email}: ${token}`);
    console.log("Password reset email would be sent here.");
  }

  async resetPassword(token: string, password: string): Promise<boolean> {
    const passwordSchema = z.string().min(6, "Password must be at least 6 characters long.");
    const validatedPassword = passwordSchema.safeParse(password);

    if (!validatedPassword.success) {
      throw new Error("Invalid password format.");
    }

    if (!token || !token.startsWith("reset_")) {
      throw new Error("Invalid password reset token format.");
    }

    const resetToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new Error("Invalid or expired password reset token.");
    }

    if (resetToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token: resetToken.token },
      });
      throw new Error("Password reset token has expired.");
    }

    const hashedPassword = await bcrypt.hash(validatedPassword.data, 10);

    await prisma.user.update({
      where: { email: resetToken.identifier },
      data: { passwordHash: hashedPassword },
    });

    await prisma.verificationToken.delete({
      where: { token: resetToken.token },
    });

    return true;
  }

  async enable2FA(userId: string): Promise<string> {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const secret = crypto.randomBytes(16).toString("hex");

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    return secret;
  }

  async verify2FA(userId: string, code: string): Promise<boolean> {
    if (!userId || !code) {
      throw new Error("User ID and code are required.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Error("Two-factor authentication is not enabled for this user.");
    }

    // Simple 2FA verification - in production, use proper TOTP/HOTP
    const isValid = user.twoFactorSecret === code;

    return isValid;
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

    if (passwordsMatch) {
      return user;
    }

    return null;
  }
}
