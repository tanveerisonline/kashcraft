import bcrypt from "bcryptjs";
import { z } from "zod";

import type { NextAuthConfig, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { cache, CacheKeys, CacheTTL } from "../cache/redis";
import prisma from "../db/prisma";
import { AuthService } from "../services/auth/auth.service";

const authService = new AuthService();

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      const cachedSession = await cache.get<Session>(
        `${CacheKeys.USER_SESSION}:${session.user.id}`
      );

      if (cachedSession) {
        return cachedSession;
      }

      const dbSession = await prisma.session.findFirst({
        where: { userId: session.user.id },
      });

      if (dbSession) {
        await cache.set(`${CacheKeys.USER_SESSION}:${session.user.id}`, session, CacheTTL.ONE_HOUR);
      }

      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await authService.login(email, password);
          if (user) {
            return user;
          }
        }

        console.error("Invalid credentials");
        return null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  // CSRF protection is enabled by default in NextAuth.js v5 when using the built-in providers and `signIn`/`signOut` helpers.
} satisfies NextAuthConfig;
