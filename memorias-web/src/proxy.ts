import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import { getRouteRedirect } from "./lib/auth/policies";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isActive = session?.user?.active === true;
  const role = session?.user?.role;

  // Create request headers to inject x-pathname for Server Components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);

  // Evaluate centralized authorization policies
  const redirectUrl = getRouteRedirect(nextUrl.pathname, {
    isLoggedIn,
    isActive,
    role,
  });

  if (redirectUrl) {
    return NextResponse.redirect(new URL(redirectUrl, req.url), { headers: requestHeaders });
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
