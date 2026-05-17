import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "mock-github-id",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "mock-github-secret",
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "mock-google-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "mock-google-secret",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        // Query database to get up-to-date role and activation status
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
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
  pages: {
    signIn: "/auth/signin",
  },
});
