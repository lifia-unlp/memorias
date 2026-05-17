import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThesisForm } from "../../ThesisForm";
import { ensureEditorOrAdmin } from "../../actions";

type Params = Promise<{ slug: string }>;

export default async function EditThesisPage({ params }: { params: Params }) {
  await ensureEditorOrAdmin();

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const thesis = await prisma.thesis.findUnique({
    where: { slug },
    include: {
      members: { select: { id: true } },
      projects: { select: { id: true } },
      publications: { select: { id: true } },
    },
  });

  if (!thesis) {
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

  const publications = await prisma.publication.findMany({
    select: {
      id: true,
      title: true,
      year: true,
    },
    orderBy: { year: "desc" },
  });

  const levelOptions = await prisma.systemOption.findMany({
    where: { listName: "thesisLevel" },
    select: { value: true },
  });
  let levels = levelOptions.map((o) => o.value);
  if (levels.length === 0) {
    levels = ["PhD", "Masters", "Grade"];
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <Header activeTab="theses" />

      <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1">
        <div className="max-w-4xl mx-auto space-y-2 mb-8">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            ✏️ Edit Thesis: <span className="text-primary">{thesis.title}</span>
          </h1>
          <p className="text-xs text-muted">
            Update thesis committee structure, milestones, associated lab resources, and slug attributes.
          </p>
        </div>

        <ThesisForm
          initialData={thesis}
          members={members}
          projects={projects}
          publications={publications}
          levels={levels}
        />
      </main>
    </div>
  );
}
