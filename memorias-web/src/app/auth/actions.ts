"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "@auth/core/errors";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Server action to initiate sign-in with an OAuth or OIDC provider.
 */
export async function handleSignInWithProvider(providerId: string, redirectTo: string = "/") {
  try {
    await signIn(providerId, { redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`/auth/signin?error=${(error as any).type || "OAuthCallbackError"}`);
    }
    throw error;
  }
}

/**
 * Server action to initiate sign-in with development credentials.
 */
export async function handleDevSignIn(email: string, devSecret: string, redirectTo: string = "/") {
  try {
    await signIn("credentials", { email, devSecret, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`/auth/signin?error=CredentialsSignin`);
    }
    throw error;
  }
}

/**
 * Server action to initiate sign-in with development credentials directly from FormData.
 */
export async function handleDevSignInForm(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const devSecret = (formData.get("devSecret") as string) || "";
  await handleDevSignIn(email, devSecret, "/");
}

/**
 * Server action to securely sign out the current user session.
 * Utilizes Auth.js signOut and ensures session cookie expiration across host and domain scopes.
 */
export async function handleSignOut(redirectTo: string = "/auth/signin") {
  const cookieStore = await cookies();
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  const useSecureCookies = process.env.NODE_ENV === "production";
  const sessionCookieName = `${useSecureCookies ? "__Secure-" : ""}authjs.session-token`;

  try {
    await signOut({ redirect: false });
  } catch (error) {
    if ((error as any)?.message !== "NEXT_REDIRECT" && (error as any)?.digest?.indexOf?.("NEXT_REDIRECT") === -1) {
      console.error("SignOut error:", error);
    }
  }

  // Clear cookie under configured domain
  if (cookieDomain) {
    cookieStore.set(sessionCookieName, "", {
      domain: cookieDomain,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  // Clear cookie host-only (RFC 6265 fallback)
  cookieStore.set(sessionCookieName, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  redirect(redirectTo);
}
