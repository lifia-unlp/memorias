import React from "react";
import { prisma } from "@/lib/prisma";
import { toggleUserActivation, updateUserRole } from "./actions";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 min-h-screen">
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
          
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors text-muted">
              Back to Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">User Administration</h1>
            <p className="text-sm text-muted">
              Authorize user sign-ups, activate editor privileges, or assign system administrators.
            </p>
          </div>
          <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold self-start">
            🛡️ Authorized Session: {session.user?.name}
          </div>
        </div>

        {/* Users Table / Grid */}
        <div className="material-card overflow-hidden border border-border p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-100/50 dark:bg-slate-800/50">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">User</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted">Role</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.image}
                            alt="avatar"
                            className="w-10 h-10 rounded-full border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-lg">
                            👤
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-sm block text-foreground leading-tight">
                            {u.name || "Unnamed User"}
                          </span>
                          <span className="text-xs text-muted block">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Role Dropdown */}
                    <td className="p-4">
                      <form
                        action={async (formData) => {
                          "use server";
                          const newRole = formData.get("role") as "USER" | "EDITOR" | "ADMIN";
                          await updateUserRole(u.id, newRole);
                        }}
                      >
                        <select
                          name="role"
                          defaultValue={u.role}
                          onChange={(e) => e.target.form?.requestSubmit()}
                          className="bg-background text-foreground text-xs font-bold border border-border px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="USER">USER</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </form>
                    </td>

                    {/* Toggle Activation Button */}
                    <td className="p-4 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await toggleUserActivation(u.id);
                        }}
                      >
                        <button
                          type="submit"
                          className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-sm ${
                            u.active
                              ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                              : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                          }`}
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
