import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isActive = session?.user?.active === true;

  const isAuthPage = nextUrl.pathname.startsWith("/auth");

  // Create request headers to inject x-pathname for Server Components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);

  // Custom policy: If already logged in AND active, redirect away from /auth pages
  if (isLoggedIn && isActive && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url), { headers: requestHeaders });
  }

  // Admin protection policy: Only logged-in, activated, ADMIN users can access /admin routes
  const isAdmin = session?.user?.role === "ADMIN";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && (!isLoggedIn || !isActive || !isAdmin)) {
    return NextResponse.redirect(new URL("/", req.url), { headers: requestHeaders });
  }

  // Reports protection policy: Only logged-in, activated users can access /reports routes
  const isReportsRoute = nextUrl.pathname.startsWith("/reports");
  if (isReportsRoute && (!isLoggedIn || !isActive)) {
    return NextResponse.redirect(new URL("/auth/signin", req.url), { headers: requestHeaders });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

// Match all routes except static resources, images, and standard APIs
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico|.*\\.svg|.*\\.png).*)",
  ],
};
export default proxy;
