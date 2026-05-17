import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ScholarshipForm } from "../../ScholarshipForm";
import { ensureEditorOrAdmin } from "../../actions";

type Params = Promise<{ slug: string }>;

export default async function EditScholarshipPage({ params }: { params: Params }) {
  await ensureEditorOrAdmin();

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const scholarship = await prisma.scholarship.findUnique({
    where: { slug },
    include: {
      members: { select: { id: true } },
      projects: { select: { id: true } },
    },
  });

  if (!scholarship) {
    notFound();
  }

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
            Edit Scholarship: <span className="text-primary">{scholarship.title}</span>
          </h1>
          <p className="text-xs text-muted">
            Update scholarship type, supervisors, timelines, and associate connected research contexts.
          </p>
        </div>

        <ScholarshipForm
          initialData={scholarship}
          members={members}
          projects={projects}
          types={types}
        />
      </main>
    </div>
  );
}
