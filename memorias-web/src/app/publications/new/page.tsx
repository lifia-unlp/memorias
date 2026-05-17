import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { PublicationForm } from "../PublicationForm";

export default async function NewPublicationPage() {
  const session = await auth();
  if (
    !session?.user?.active ||
    (session.user.role !== "EDITOR" && session.user.role !== "ADMIN")
  ) {
    redirect("/publications");
  }

  // Fetch all options to populate relation selectors
  const members = await prisma.member.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });

  const projects = await prisma.project.findMany({
    select: { id: true, title: true, code: true },
    orderBy: { endDate: "desc" },
  });

  const theses = await prisma.thesis.findMany({
    select: { id: true, title: true, student: true },
    orderBy: { endDate: "desc" },
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <Header activeTab="publications" />

      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-12 px-6 shadow-inner relative overflow-hidden border-b border-blue-700/20">
        <div className="max-w-7xl mx-auto z-10 relative">
          <h1 className="text-4xl font-extrabold tracking-tight">Add Publication</h1>
          <p className="text-blue-100 text-sm mt-2 max-w-xl">
            Ingest and register a new scientific publication into the LIFIA bibliography system.
          </p>
        </div>
      </section>

      <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1">
        <PublicationForm
          members={members}
          projects={projects}
          theses={theses}
        />
      </main>
    </div>
  );
}
