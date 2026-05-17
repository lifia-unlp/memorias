import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      // Map fields from the JWT token (populated in authConfig.callbacks.jwt)
      if (session.user && token) {
        session.user.role = token.role as "USER" | "ADMIN" | undefined;
        session.user.active = token.active as boolean | undefined;
        session.user.id = token.sub as string;
      }
      
      // Since this auth instance is only invoked in Node.js runtime environments (API routes, RSCs),
      // we can query the database directly to guarantee the absolute latest active/role fields.
      if (session.user && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, active: true },
        });
        
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.active = dbUser.active;
        }
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
