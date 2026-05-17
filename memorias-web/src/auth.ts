import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
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
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Map fields from the JWT token (populated in the jwt callback above)
      if (session.user && token) {
        session.user.role = token.role as "USER" | "ADMIN" | undefined;
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
        const active = count === 1 ? true : false;

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
