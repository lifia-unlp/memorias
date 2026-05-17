import { type DefaultSession, type DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "USER" | "EDITOR" | "ADMIN";
      active?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "USER" | "EDITOR" | "ADMIN";
    active?: boolean;
  }
}
