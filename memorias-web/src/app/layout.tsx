import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getRouteRedirect } from "@/lib/auth/policies";
import ThemeRegistry from "@/components/ThemeRegistry";
import { ThemeContextProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Memorias | Scientific Research Portal",
  description: "A premium repository and laboratory management portal. Discover publications, defended theses, and active research projects.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Evaluate centralized authorization policies in Server Component layout
  const redirectUrl = getRouteRedirect(pathname, {
    isLoggedIn: !!session?.user,
    isActive: session?.user?.active === true,
    role: session?.user?.role,
  });

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  const highlightSemantics = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_HIGHLIGHT_SEMANTIC_COMPONENTS === "true";

  return (
    <html lang="en">
      <body
        className={highlightSemantics ? "highlight-semantics-enabled" : ""}
        style={{ margin: 0, minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <ThemeRegistry>
          <ThemeContextProvider>
            {children}
          </ThemeContextProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
