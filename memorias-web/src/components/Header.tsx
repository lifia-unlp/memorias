import React from "react";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Logo } from "@/components/Logo";

interface HeaderProps {
  activeTab?: "members" | "projects" | "theses" | "scholarships" | "publications";
}

export async function Header({ activeTab }: HeaderProps) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Unified Configurable Logo */}
        <div className="flex items-center gap-6">
          <Logo />

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
                  </div>
                </div>
              </div>
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
            <div className="relative group">
              {/* Trigger Button: Avatar + Name + Role */}
              <button
                type="button"
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left cursor-pointer border border-transparent hover:border-border"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full border border-border shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    {session.user?.name?.[0] || "U"}
                  </div>
                )}
                <div className="text-left hidden sm:block leading-tight">
                  <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {session.user?.name}
                  </span>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider mt-0.5">
                    {session.user?.role}
                  </span>
                </div>
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-450 dark:text-slate-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu Items */}
              <div className="absolute right-0 top-full pt-1.5 w-48 hidden group-hover:block z-50">
                <div className="rounded-xl border border-border bg-white dark:bg-slate-900 shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    href="/preferences"
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all"
                  >
                    Preferences
                  </Link>
                  <div className="border-t border-border my-1" />
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full text-left block px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 transition-all cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
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
