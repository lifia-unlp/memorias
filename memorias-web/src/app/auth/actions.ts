"use server";

import { signOut } from "@/auth";

/**
 * Server action to securely sign out the current user session.
 * Utilizes the Auth.js signOut method directly to invalidate session cookies
 * and perform an atomic server-side redirect.
 */
export async function handleSignOut(redirectTo: string = "/") {
  await signOut({ redirectTo });
}
