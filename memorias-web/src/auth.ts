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
        session.user.firstName = token.firstName as string | null | undefined;
        session.user.lastName = token.lastName as string | null | undefined;
        session.user.id = token.sub as string;
      }
      
      // Since this auth instance is only invoked in Node.js runtime environments (API routes, RSCs),
      // we can query the database directly to guarantee the absolute latest active/role fields.
      if (session.user && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, active: true, firstName: true, lastName: true },
        });
        
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.active = dbUser.active;
          session.user.firstName = dbUser.firstName;
          session.user.lastName = dbUser.lastName;
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        const count = await prisma.user.count();
        if (count === 1) {
          // The first user created in the database is automatically assigned ADMIN role & activated!
          await prisma.user.update({
            where: { id: user.id },
            data: {
              role: "ADMIN",
              active: true,
            },
          });
          console.log(`🎉 Bootstrapped first ADMIN user: ${user.email}`);
        }
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
