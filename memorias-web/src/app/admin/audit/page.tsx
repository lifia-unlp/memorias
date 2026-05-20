import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Pagination } from "@/components/Pagination";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    action?: string;
    entityType?: string;
    limit?: string;
    page?: string;
  }>;
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    redirect("/");
  }

  const { search, action, entityType, limit: limitParam, page: pageParam } = await searchParams;

  const limit = parseInt(limitParam || "20", 10) || 20;
  const page = parseInt(pageParam || "1", 10) || 1;
  const skip = (page - 1) * limit;
  const take = limit;

  // Build prisma query filters
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { userEmail: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
      { entitySlug: { contains: search, mode: "insensitive" } },
    ];
  }

  if (action) {
    whereClause.action = action;
  }

  if (entityType) {
    whereClause.entityType = entityType;
  }

  // Fetch audit logs sorted by newest with dynamic pagination skips
  const logs = await prisma.auditLog.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  // Fetch matched count for pagination calculations
  const matchedLogsCount = await prisma.auditLog.count({
    where: whereClause,
  });
  const totalPages = Math.ceil(matchedLogsCount / limit);

  // Calculate statistics for metrics cards
  const totalLogs = await prisma.auditLog.count();
  const createsCount = await prisma.auditLog.count({ where: { action: "CREATE" } });
  const updatesCount = await prisma.auditLog.count({ where: { action: "UPDATE" } });
  const deletesCount = await prisma.auditLog.count({ where: { action: "DELETE" } });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="relative w-10 h-10 flex items-center justify-center bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <circle cx="50" cy="50" r="15" fill="none" stroke="var(--secondary)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="var(--secondary)" strokeWidth="6" strokeDasharray="10 8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="4" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-primary dark:text-white">MEMORIAS</span>
                <span className="text-xs block text-muted font-medium tracking-widest uppercase">Auditing System</span>
              </div>
            </Link>
          </div>
          
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/admin/config" className="hover:text-primary transition-colors text-muted">
              System Settings
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

      {/* Main Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white">System Auditing Logs</h1>
            <p className="text-sm text-muted">
              Real-time administrative feed tracking creation, edits, and deletions across all scientific lab records.
            </p>
          </div>
          <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold self-start">
            Authorized Session: {session.user?.name}
          </div>
        </div>

        {/* Dynamic Metric Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Operations</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black">{totalLogs}</span>
              <span className="text-xs font-bold text-primary">actions</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-green-500 uppercase tracking-wider block">Creations</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-green-600 dark:text-green-400">{createsCount}</span>
              <span className="text-xs font-bold text-muted">items</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">Edits / Updates</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{updatesCount}</span>
              <span className="text-xs font-bold text-muted">updates</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider block">Deletions</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-red-600 dark:text-red-400">{deletesCount}</span>
              <span className="text-xs font-bold text-muted">purged</span>
            </div>
          </div>
        </div>

        {/* Interactive Log Filters */}
        <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Search Details / Users</label>
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Search by email, name, description..."
                className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Operation Action</label>
              <select
                name="action"
                defaultValue={action || ""}
                className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
              >
                <option value="">All Operations</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Entity Model</label>
              <select
                name="entityType"
                defaultValue={entityType || ""}
                className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
              >
                <option value="">All Entities</option>
                <option value="Member">Members</option>
                <option value="Project">Projects</option>
                <option value="Thesis">Theses</option>
                <option value="Scholarship">Scholarships</option>
                <option value="Publication">Publications</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Items Per Page</label>
              <select
                name="limit"
                defaultValue={limit.toString()}
                className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm font-semibold"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="30">30 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>

            <div className="md:col-span-5 flex justify-end gap-3 pt-2">
              <Link
                href="/admin/audit"
                className="px-4 py-2 rounded-xl border border-border text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs cursor-pointer flex items-center justify-center"
              >
                Clear Filters
              </Link>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Logs Feed Container */}
        <div className="bg-white dark:bg-slate-900 border border-border p-0 rounded-2xl shadow-sm overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium space-y-2">
              <p className="text-sm font-semibold">No audit logs found matching selected parameters.</p>
              <p className="text-xs text-muted">Try modifying the search term or clear the filter forms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-100/50 dark:bg-slate-800/50">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Date & Time</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">User Profile</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Action</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Model & Type</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Change Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {logs.map((log) => {
                    // Action styling
                    let actionBadge = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700";
                    if (log.action === "CREATE") {
                      actionBadge = "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50";
                    } else if (log.action === "UPDATE") {
                      actionBadge = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
                    } else if (log.action === "DELETE") {
                      actionBadge = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50";
                    }

                    // Entity Type styling
                    const typeBadge = "bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded text-[10px] font-bold";

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors font-medium"
                      >
                        <td className="p-4 text-slate-500 font-mono whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="p-4">
                          <span className="font-bold block text-slate-800 dark:text-slate-200">
                            {log.userEmail || "System/Anonymous"}
                          </span>
                          <span className="text-[10px] text-muted block font-mono">
                            ID: {log.userId || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-black tracking-wider ${actionBadge}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={typeBadge}>
                            {log.entityType}
                          </span>
                          {log.entitySlug && (
                            <span className="block text-[10px] text-muted font-mono mt-0.5 truncate max-w-[150px]">
                              slug: {log.entitySlug}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                          {log.details || "No changes description provided."}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-4 bg-slate-55/20 dark:bg-slate-900/20 border-t border-border">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  currentSearchParams={{ search, action, entityType, limit }}
                  baseUrl="/admin/audit"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
