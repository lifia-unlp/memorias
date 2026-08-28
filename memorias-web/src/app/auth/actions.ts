"use server";

import { signIn, signOut } from "@/auth";

/**
 * Server action to initiate sign-in with an OAuth or OIDC provider.
 */
export async function handleSignInWithProvider(providerId: string, redirectTo: string = "/") {
  await signIn(providerId, { redirectTo });
}

/**
 * Server action to initiate sign-in with development credentials.
 */
export async function handleDevSignIn(email: string, devSecret: string, redirectTo: string = "/") {
  await signIn("credentials", { email, devSecret, redirectTo });
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
 * Utilizes the Auth.js signOut method directly to invalidate session cookies
 * and perform an atomic server-side redirect.
 */
export async function handleSignOut(redirectTo: string = "/") {
  await signOut({ redirectTo });
}
