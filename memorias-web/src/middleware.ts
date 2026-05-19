import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const middleware = auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isActive = session?.user?.active === true;

  const isPendingPage = nextUrl.pathname === "/pending-activation";
  const isAuthPage = nextUrl.pathname.startsWith("/auth");
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
  
  // Custom policy: If logged in but not activated by an admin, restrict to /pending-activation
  if (isLoggedIn && !isActive && !isPendingPage && !isAuthPage && !isApiAuth) {
    return NextResponse.redirect(new URL("/pending-activation", req.url));
  }

  // Admin protection policy: Only logged-in, activated, ADMIN users can access /admin routes
  const isAdmin = session?.user?.role === "ADMIN";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && (!isLoggedIn || !isActive || !isAdmin)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Reports protection policy: Only logged-in, activated users can access /reports routes
  const isReportsRoute = nextUrl.pathname.startsWith("/reports");
  if (isReportsRoute && (!isLoggedIn || !isActive)) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
});

// Match all routes except static resources, images, and standard APIs
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico|.*\\.svg|.*\\.png).*)",
  ],
};
export default middleware;
