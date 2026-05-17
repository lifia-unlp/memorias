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
        // Split full name into firstName and lastName if present
        let firstName = "";
        let lastName = "";
        if (user.name) {
          const parts = user.name.trim().split(/\s+/);
          firstName = parts[0] || "";
          lastName = parts.slice(1).join(" ") || "";
        }

        const count = await prisma.user.count();
        const role = count === 1 ? "ADMIN" : "USER";
        const active = count === 1 ? true : false;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            role,
            active,
            firstName: firstName || null,
            lastName: lastName || null,
          },
        });
        console.log(`🎉 Registered user: ${user.email} (Role: ${role}, Active: ${active}, First: ${firstName}, Last: ${lastName})`);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
