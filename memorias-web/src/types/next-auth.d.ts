import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "USER" | "ADMIN";
      active?: boolean;
      firstName?: string | null;
      lastName?: string | null;
    } & DefaultSession["user"];
  }
}
