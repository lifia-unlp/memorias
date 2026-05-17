import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export default {
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.active = user.active;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as "USER" | "ADMIN" | undefined;
        session.user.active = token.active as boolean | undefined;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig;
