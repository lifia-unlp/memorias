import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleSignInWithProvider,
  handleDevSignIn,
  handleDevSignInForm,
  handleSignOut,
} from "../actions";
import { AuthError, CredentialsSignin } from "@auth/core/errors";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error("NEXT_REDIRECT");
    (err as any).digest = `NEXT_REDIRECT;${url}`;
    throw err;
  }),
}));

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";

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

    it("catches AuthError and redirects to /auth/signin?error=...", async () => {
      const authError = new AuthError("OAuthCallbackError");
      (authError as any).type = "OAuthCallbackError";
      vi.mocked(signIn).mockRejectedValueOnce(authError);

      await expect(handleSignInWithProvider("google")).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/auth/signin?error=OAuthCallbackError");
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

    it("catches CredentialsSignin AuthError and gracefully redirects to /auth/signin?error=CredentialsSignin", async () => {
      const credentialsError = new CredentialsSignin();
      vi.mocked(signIn).mockRejectedValueOnce(credentialsError);

      await expect(handleDevSignIn("dev@lifia.edu.ar", "wrongsecret")).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/auth/signin?error=CredentialsSignin");
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

    it("catches CredentialsSignin on form submission and redirects to /auth/signin?error=CredentialsSignin", async () => {
      const credentialsError = new CredentialsSignin();
      vi.mocked(signIn).mockRejectedValueOnce(credentialsError);

      const formData = new FormData();
      formData.set("email", "test@lifia.edu.ar");
      formData.set("devSecret", "wrongpass");

      await expect(handleDevSignInForm(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/auth/signin?error=CredentialsSignin");
    });
  });

  describe("handleSignOut", () => {
    it("calls signOut with default redirectTo '/auth/signin'", async () => {
      await handleSignOut();
      expect(signOut).toHaveBeenCalledWith({ redirectTo: "/auth/signin" });
    });

    it("calls signOut with custom redirectTo", async () => {
      await handleSignOut("/");
      expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
    });
  });
});
