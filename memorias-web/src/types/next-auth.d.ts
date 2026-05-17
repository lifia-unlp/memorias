import { type DefaultSession, type DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "USER" | "ADMIN";
      active?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "USER" | "ADMIN";
    active?: boolean;
  }
}
