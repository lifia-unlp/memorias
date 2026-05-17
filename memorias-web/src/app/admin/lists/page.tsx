import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ListDashboardClient from "./ListDashboardClient";

export const metadata = {
  title: "Manage Configurable Lists | Admin Dashboard",
  description: "Configure positions, levels, and scholarship categories in the Memorias portal.",
};

export default async function AdminListsPage() {
  const session = await auth();
  if (!session?.user?.active || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all options
  const allOptions = await prisma.systemOption.findMany({
    orderBy: { value: "asc" },
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="relative w-10 h-10 flex items-center justify-center bg-primary/5 rounded-xl border border-primary/10">
                <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <circle cx="50" cy="50" r="15" fill="none" stroke="var(--secondary)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="var(--secondary)" strokeWidth="6" strokeDasharray="10 8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="4" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-primary dark:text-white">MEMORIAS</span>
                <span className="text-xs block text-muted font-medium tracking-widest uppercase">Admin Dashboard</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all border border-border/80 shadow-sm"
            >
              👤 Manage Users
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-xl shadow-md shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
            >
              Portal Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Intro / Stats Panel */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h1 className="text-2xl font-black text-primary leading-tight">Configurable Lists</h1>
            <p className="text-xs text-muted leading-relaxed">
              Define, configure, and maintain allowed metadata choices used in the database. Only Admins can edit options.
            </p>
            <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/15 space-y-1">
              <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block">Usage Integrity Enabled</span>
              <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-normal">
                If an option in use is deleted, the system forces a bulk reassignment or clear action to maintain data integrity.
              </p>
            </div>
          </div>
        </section>

        {/* Right Dynamic Config Panel */}
        <section className="lg:col-span-3">
          <ListDashboardClient initialOptions={allOptions} />
        </section>
      </main>
    </div>
  );
}
