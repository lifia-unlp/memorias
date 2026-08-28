import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleSignInWithProvider,
  handleDevSignIn,
  handleDevSignInForm,
  handleSignOut,
} from "../actions";

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { signIn, signOut } from "@/auth";

describe("Auth Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleSignInWithProvider", () => {
    it("calls signIn with provider and default redirectTo '/'", async () => {
      await handleSignInWithProvider("orcid");
      expect(signIn).toHaveBeenCalledWith("orcid", { redirectTo: "/" });
    });

    it("calls signIn with provider and custom redirectTo", async () => {
      await handleSignInWithProvider("github", "/dashboard");
      expect(signIn).toHaveBeenCalledWith("github", { redirectTo: "/dashboard" });
    });
  });

  describe("handleDevSignIn", () => {
    it("calls signIn credentials with email, devSecret and default redirectTo '/'", async () => {
      await handleDevSignIn("dev@lifia.edu.ar", "secret123");
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "dev@lifia.edu.ar",
        devSecret: "secret123",
        redirectTo: "/",
      });
    });

    it("calls signIn credentials with custom redirectTo", async () => {
      await handleDevSignIn("dev@lifia.edu.ar", "secret123", "/admin");
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "dev@lifia.edu.ar",
        devSecret: "secret123",
        redirectTo: "/admin",
      });
    });
  });

  describe("handleDevSignInForm", () => {
    it("extracts credentials from FormData and calls signIn", async () => {
      const formData = new FormData();
      formData.set("email", "test@lifia.edu.ar");
      formData.set("devSecret", "pass456");

      await handleDevSignInForm(formData);
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@lifia.edu.ar",
        devSecret: "pass456",
        redirectTo: "/",
      });
    });
  });

  describe("handleSignOut", () => {
    it("calls signOut with default redirectTo '/'", async () => {
      await handleSignOut();
      expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
    });

    it("calls signOut with custom redirectTo", async () => {
      await handleSignOut("/auth/signin");
      expect(signOut).toHaveBeenCalledWith({ redirectTo: "/auth/signin" });
    });
  });
});
