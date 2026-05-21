import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm";
import { Logo } from "@/components/Logo";

export default async function AdminConfigPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    redirect("/");
  }

  // Load current values with defensive optional chaining for cached Prisma clients
  const titleOption = await (prisma as any).systemSetting?.findUnique({ where: { key: "welcome_title" } }).catch(() => null);
  const subtitleOption = await (prisma as any).systemSetting?.findUnique({ where: { key: "welcome_subtitle" } }).catch(() => null);
  const logoOption = await (prisma as any).systemSetting?.findUnique({ where: { key: "logo_url" } }).catch(() => null);
  const labNameOption = await (prisma as any).systemSetting?.findUnique({ where: { key: "lab_name" } }).catch(() => null);
  const labUrlOption = await (prisma as any).systemSetting?.findUnique({ where: { key: "lab_url" } }).catch(() => null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requireActivationOption = await (prisma as any).systemSetting?.findUnique({ where: { key: "require_user_activation" } }).catch(() => null);

  const initialTitle = titleOption?.value || "Welcome to Memorias";
  const initialSubtitle =
    subtitleOption?.value ||
    "A state-of-the-art research repository and laboratory management portal. Discover publications, explore active research projects, and access defended theses.";
  const initialLogoUrl = logoOption?.value || "";
  const initialLabName = labNameOption?.value || process.env.LAB_NAME || "LIFIA";
  const initialLabUrl = labUrlOption?.value || process.env.LAB_URL || "https://lifia.info.unlp.edu.ar";
  const initialRequireUserActivation = requireActivationOption?.value === "true";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/admin/audit" className="hover:text-primary transition-colors text-muted">
              Auditing Logs
            </Link>
            <Link href="/admin/users" className="hover:text-primary transition-colors text-muted border-l border-border pl-4">
              Users Panel
            </Link>
            <Link href="/" className="hover:text-primary transition-colors text-muted border-l border-border pl-4">
              Back to Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white">System Settings</h1>
            <p className="text-sm text-muted">
              Customize portal branding, site title welcome headers, and initial landing page introduction configurations.
            </p>
          </div>
          <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold self-start">
            Authorized Session: {session.user?.name}
          </div>
        </div>

        <ConfigForm
          initialTitle={initialTitle}
          initialSubtitle={initialSubtitle}
          initialLogoUrl={initialLogoUrl}
          initialLabName={initialLabName}
          initialLabUrl={initialLabUrl}
          initialRequireUserActivation={initialRequireUserActivation}
        />
      </main>

    </div>
  );
}
