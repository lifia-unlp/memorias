import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { userService } from "@/lib/services/userService";
import authConfig from "./auth.config";

import Credentials from "next-auth/providers/credentials";

/**
 * Node.js Runtime NextAuth initialization.
 *
 * Extends the Edge configuration (`auth.config.ts`) with Prisma database adapter,
 * complete user profile loading in JWT callbacks, and development credentials.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "text" },
        devSecret: { label: "Dev Secret Passphrase", type: "password" },
      },
      async authorize(credentials) {
        if (
          process.env.NODE_ENV !== "development" ||
          process.env.ENABLE_DEV_LOGIN !== "true"
        ) {
          return null;
        }

        const expectedSecret = process.env.DEV_LOGIN_SECRET;
        if (!expectedSecret || credentials?.devSecret !== expectedSecret) {
          return null;
        }

        const email = (credentials?.email as string)?.trim();
        if (!email) {
          return null;
        }

        let user = await userService.getUserByEmail(email);

        if (!user) {
          user = await userService.createDevUser(email);
        } else {
          if (!user.active) {
            return null;
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.active = user.active;
        token.id = user.id;
      }
      
      // Always fetch the latest fields directly from the database to keep the JWT cookie up-to-date
      if (token.sub) {
        const dbUser = await userService.getUserJwtFields(token.sub);
        if (dbUser) {
          token.role = dbUser.role;
          token.active = dbUser.active;
          token.notificationEmail = dbUser.notificationEmail;
          token.avatarUrl = dbUser.avatarUrl;
          token.digestEmails = dbUser.digestEmails;
          token.immediateNotifications = dbUser.immediateNotifications;
          token.memberId = dbUser.memberId;
        } else {
          // Invalidate the session if the user was deleted from the database
          token.role = undefined;
          token.active = false;
          token.sub = undefined;
          token.email = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Map fields from the JWT token (populated in the jwt callback above)
      if (session.user && token) {
        session.user.role = token.role as "USER" | "EDITOR" | "POWER_EDITOR" | "ADMIN" | undefined;
        session.user.active = token.active as boolean | undefined;
        session.user.id = token.sub as string;
        session.user.notificationEmail = token.notificationEmail as string | null | undefined;
        session.user.avatarUrl = token.avatarUrl as string | null | undefined;
        session.user.digestEmails = token.digestEmails as boolean | undefined;
        session.user.immediateNotifications = token.immediateNotifications as boolean | undefined;
        session.user.memberId = token.memberId as string | null | undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        const dbUser = await userService.handleUserRegistration(
          user.id,
          user.email || null,
          user.image || null
        );
        console.log(`🎉 Registered user: ${dbUser.email} (Role: ${dbUser.role}, Active: ${dbUser.active})`);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
