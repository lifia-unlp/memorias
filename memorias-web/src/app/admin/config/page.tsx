import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm";

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

  const initialTitle = titleOption?.value || "Welcome to Memorias";
  const initialSubtitle =
    subtitleOption?.value ||
    "A state-of-the-art research repository and laboratory management portal. Discover publications, explore active research projects, and access defended theses.";
  const initialLogoUrl = logoOption?.value || "";
  const initialLabName = labNameOption?.value || process.env.LAB_NAME || "LIFIA";
  const initialLabUrl = labUrlOption?.value || process.env.LAB_URL || "https://lifia.info.unlp.edu.ar";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="relative w-10 h-10 flex items-center justify-center bg-primary/5 rounded-xl border border-primary/10">
                {initialLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={initialLogoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover p-1"
                  />
                ) : (
                  <svg viewBox="0 0 100 100" className="w-8 h-8">
                    <circle cx="50" cy="50" r="15" fill="none" stroke="var(--secondary)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="var(--secondary)" strokeWidth="6" strokeDasharray="10 8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="4" />
                  </svg>
                )}
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-primary dark:text-white">MEMORIAS</span>
                <span className="text-xs block text-muted font-medium tracking-widest uppercase">Configuration Panel</span>
              </div>
            </Link>
          </div>

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
        />
      </main>

    </div>
  );
}
