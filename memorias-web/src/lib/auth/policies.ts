export interface UserAuthContext {
  isLoggedIn: boolean;
  isActive: boolean;
  role?: string;
}

export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/auth");
}

export function isApiAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/api/auth");
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isReportsRoute(pathname: string): boolean {
  return pathname.startsWith("/reports");
}

export function isPendingActivationRoute(pathname: string): boolean {
  return pathname === "/pending-activation";
}

/**
 * Evaluates route access against user session state.
 * Returns target redirect URL string if access is disallowed, or null if allowed.
 */
export function getRouteRedirect(
  pathname: string,
  auth: UserAuthContext
): string | null {
  const { isLoggedIn, isActive, role } = auth;
  const isAdmin = role === "ADMIN";

  // 1. Inactive logged-in users must be redirected to /pending-activation
  // (unless accessing /pending-activation, /auth, or /api/auth)
  if (isLoggedIn && !isActive) {
    if (
      !isPendingActivationRoute(pathname) &&
      !isAuthRoute(pathname) &&
      !isApiAuthRoute(pathname)
    ) {
      return "/pending-activation";
    }
  }

  // 2. Active logged-in users shouldn't access /pending-activation
  if (isLoggedIn && isActive && isPendingActivationRoute(pathname)) {
    return "/";
  }

  // 3. Active logged-in users shouldn't access /auth sign-in pages
  if (isLoggedIn && isActive && isAuthRoute(pathname)) {
    return "/";
  }

  // 4. Admin route protection: Only logged in, active ADMIN users
  if (isAdminRoute(pathname) && (!isLoggedIn || !isActive || !isAdmin)) {
    return "/";
  }

  // 5. Reports route protection: Only logged in, active users
  if (isReportsRoute(pathname) && (!isLoggedIn || !isActive)) {
    return "/auth/signin";
  }

  return null;
}
