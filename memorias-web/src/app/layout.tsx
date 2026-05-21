import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

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

  const isLoggedIn = !!session?.user;
  const isActive = session?.user?.active === true;

  const isPendingPage = pathname === "/pending-activation";
  const isAuthPage = pathname.startsWith("/auth");
  const isApiAuth = pathname.startsWith("/api/auth");

  // Real-time active status check:
  // If logged in but inactive, strictly restrict access to /pending-activation (unless on auth or api routes)
  if (isLoggedIn && !isActive) {
    if (!isPendingPage && !isAuthPage && !isApiAuth) {
      redirect("/pending-activation");
    }
  }

  // If logged in and already activated, redirect away from /pending-activation to homepage
  if (isLoggedIn && isActive && isPendingPage) {
    redirect("/");
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
