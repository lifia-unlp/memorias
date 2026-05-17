import React from "react";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProjectForm } from "../ProjectForm";
import { prisma } from "@/lib/prisma";

export default async function NewProjectPage() {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  if (!isEditorOrAdmin) {
    redirect("/projects");
  }

  // Fetch members to populate the association grid
  const members = await prisma.member.findMany({
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      positionAtLab: true,
    },
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/projects"
              className="text-xs font-bold text-slate-500 hover:text-primary transition-all flex items-center gap-1.5"
            >
              <span>⬅️</span> Back to Projects
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {session.user?.name}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  ⚡ {session.user?.role}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Title Banner */}
      <section className="relative overflow-hidden bg-primary text-white py-10 px-6 shadow-inner border-b border-blue-700">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto space-y-2 relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Create Research Project</h1>
          <p className="text-blue-100 max-w-xl text-sm">
            Launch a new research project profile. Funding agency allocations, website redirects, and associated members will be linked dynamically.
          </p>
        </div>
      </section>

      {/* Form Area */}
      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1">
        <ProjectForm members={members} />
      </main>
    </div>
  );
}
