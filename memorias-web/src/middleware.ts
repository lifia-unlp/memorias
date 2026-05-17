import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
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

  return NextResponse.next();
});

// Match all routes except static resources, images, and standard APIs
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico|.*\\.svg|.*\\.png).*)",
  ],
};
