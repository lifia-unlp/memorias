import React from "react";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface HeaderProps {
  activeTab?: "members" | "projects" | "theses" | "scholarships" | "publications" | "ai-chat";
}

export async function Header({ activeTab }: HeaderProps) {
  const session = await auth();
  const logoSetting = await (prisma as any).systemSetting?.findUnique({ where: { key: "logo_url" } }).catch(() => null);
  const logoUrl = logoSetting?.value || "";
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Unified Configurable Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all duration-200">
            <div className="relative w-10 h-10 flex items-center justify-center bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover p-1"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-8 h-8">
                  {/* Logo Wave Icon (Secondary Color) */}
                  <circle cx="50" cy="50" r="15" fill="none" stroke="var(--secondary)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="var(--secondary)" strokeWidth="6" strokeDasharray="10 8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="4" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-primary dark:text-white">MEMORIAS</span>
              <span className="text-xs block text-muted font-medium tracking-widest uppercase">Research Portal</span>
            </div>
          </Link>

          {/* Core Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Link
              href="/members"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "members"
                  ? "bg-primary/10 text-primary font-extrabold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Members
            </Link>
            <Link
              href="/projects"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "projects"
                  ? "bg-primary/10 text-primary font-extrabold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Projects
            </Link>
            <Link
              href="/theses"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "theses"
                  ? "bg-primary/10 text-primary font-extrabold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Theses
            </Link>
            <Link
              href="/scholarships"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "scholarships"
                  ? "bg-primary/10 text-primary font-extrabold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Scholarships
            </Link>
            <Link
              href="/publications"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "publications"
                  ? "bg-primary/10 text-primary font-extrabold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Publications
            </Link>
            {/* Reports Links */}
            {session?.user?.active && (
              <div className="relative group pl-1.5 border-l border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer font-bold"
                >
                  Reports
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Dropdown Menu Items */}
                <div className="absolute left-0 top-full pt-1.5 w-48 hidden group-hover:block z-50">
                  <div className="rounded-xl border border-border bg-white dark:bg-slate-900 shadow-lg py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/reports/statistics"
                      className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all"
                    >
                      Statistics
                    </Link>
                    <Link
                      href="/reports/builder"
                      className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all"
                    >
                      Report Builder
                    </Link>
                    <Link
                      href="/ai-chat"
                      className="block px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all border-t border-border mt-1 pt-2 flex items-center gap-1"
                    >
                      Ask AI ✨
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* AI Assistant Link */}
            {session?.user?.active && (
              <Link
                href="/ai-chat"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${
                  activeTab === "ai-chat"
                    ? "bg-primary/10 text-primary font-extrabold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                AI Assistant
                <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/10 dark:ring-emerald-400/20">
                  New
                </span>
              </Link>
            )}

            {/* Admin Links */}
            {session?.user?.role === "ADMIN" && (
              <div className="relative group pl-1.5 border-l border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer font-bold"
                >
                  Admin Menu
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                                {/* Dropdown Menu Items */}
                <div className="absolute left-0 top-full pt-1.5 w-48 hidden group-hover:block z-50">
                  <div className="rounded-xl border border-border bg-white dark:bg-slate-900 shadow-lg py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/admin/config"
                      className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all"
                    >
                      System Config
                    </Link>
                    <Link
                      href="/admin/lists"
                      className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all"
                    >
                      Lists Dashboard
                    </Link>
                    <Link
                      href="/admin/users"
                      className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all"
                    >
                      Users Panel
                    </Link>
                    <Link
                      href="/admin/tags"
                      className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all"
                    >
                      Tag Curation
                    </Link>
                    <Link
                      href="/admin/audit"
                      className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all border-t border-border mt-1 pt-2"
                    >
                      Auditing Logs
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Authentication Controls */}
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full border border-border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center text-xs font-bold font-mono">
                    {session.user?.name?.[0] || "U"}
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {session.user?.name}
                  </span>
                  <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                    {session.user?.role}
                  </span>
                </div>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 px-3.5 py-1.5 rounded-xl border border-border transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="text-xs font-bold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
