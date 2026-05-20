import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

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
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID || "mock-microsoft-id",
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET || "mock-microsoft-secret",
    }),
    {
      id: "orcid",
      name: "ORCID",
      type: "oidc",
      issuer: process.env.AUTH_ORCID_ISSUER || "https://sandbox.orcid.org",
      clientId: process.env.AUTH_ORCID_ID || "mock-orcid-id",
      clientSecret: process.env.AUTH_ORCID_SECRET || "mock-orcid-secret",
      authorization: {
        params: { scope: "openid profile" },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim() || null,
          email: profile.email || null,
        };
      },
    },
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
        session.user.role = token.role as "USER" | "EDITOR" | "ADMIN" | undefined;
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
