import React from "react";
import { auth, signOut } from "@/auth";
import Link from "next/link";

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
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all duration-200">
            <div className="relative w-10 h-10 flex items-center justify-center bg-primary/5 rounded-xl border border-primary/10">
              <svg viewBox="0 0 100 100" className="w-8 h-8">
                {/* Logo Wave Icon (Secondary Color) */}
                <circle cx="50" cy="50" r="15" fill="none" stroke="var(--secondary)" strokeWidth="8" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="var(--secondary)" strokeWidth="6" strokeDasharray="10 8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="4" />
              </svg>
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
              👥 Members
            </Link>
            <Link
              href="/projects"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "projects"
                  ? "bg-primary/10 text-primary font-extrabold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              📁 Projects
            </Link>
            <Link
              href="/theses"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "theses"
                  ? "bg-primary/10 text-primary font-extrabold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              🎓 Theses
            </Link>
            <Link
              href="/publications"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "publications"
                  ? "bg-primary/10 text-primary font-extrabold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              📚 Publications
            </Link>
            
            {/* Admin Links */}
            {session?.user?.role === "ADMIN" && (
              <>
                <span className="text-slate-300 dark:text-slate-700 px-1">|</span>
                <Link
                  href="/admin/users"
                  className="px-3 py-1.5 rounded-lg text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                >
                  ⚙️ Users
                </Link>
                <Link
                  href="/admin/lists"
                  className="px-3 py-1.5 rounded-lg text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                >
                  📋 Lists
                </Link>
              </>
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
