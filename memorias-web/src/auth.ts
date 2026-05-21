import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import authConfig from "./auth.config";

import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Development Backdoor",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        role: { label: "Role (USER/EDITOR/ADMIN)", type: "text", placeholder: "ADMIN" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV !== "development") {
          return null;
        }
        const email = (credentials?.email as string) || "admin@example.com";
        const role = (credentials?.role as string) || "ADMIN";

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: "Dev Admin Backdoor",
              role: role as Role,
              active: true,
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              role: role as Role,
              active: true,
            },
          });
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
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, active: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.active = dbUser.active;
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
        session.user.role = token.role as "USER" | "EDITOR" | "ADMIN" | undefined;
        session.user.active = token.active as boolean | undefined;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        const count = await prisma.user.count();
        const role = count === 1 ? "ADMIN" : "USER";
        
        let active = true;
        if (count > 1) {
          const requireActivationSetting = await prisma.systemSetting.findUnique({
            where: { key: "require_user_activation" },
          }).catch(() => null);
          if (requireActivationSetting?.value === "true") {
            active = false;
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            role,
            active,
          },
        });
        console.log(`🎉 Registered user: ${user.email} (Role: ${role}, Active: ${active})`);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
