import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { ScholarshipForm } from "../ScholarshipForm";
import { ensureEditorOrAdmin } from "../actions";

export default async function NewScholarshipPage() {
  await ensureEditorOrAdmin();

  // Load relation datasets
  const members = await prisma.member.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      positionAtLab: true,
    },
    orderBy: { lastName: "asc" },
  });

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { title: "asc" },
  });

  const typeOptions = await prisma.systemOption.findMany({
    where: { listName: "scholarshipType" },
    select: { value: true },
  });
  let types = typeOptions.map((o) => o.value);
  if (types.length === 0) {
    types = ["Doctoral", "Postdoctoral", "Training"];
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <Header activeTab="scholarships" />

      <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1">
        <div className="max-w-4xl mx-auto space-y-2 mb-8">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            🎫 Add New Scholarship
          </h1>
          <p className="text-xs text-muted">
            Configure scholarship student profiles, directors, funding structures, and link co-authors or research projects.
          </p>
        </div>

        <ScholarshipForm
          members={members}
          projects={projects}
          types={types}
        />
      </main>
    </div>
  );
}
