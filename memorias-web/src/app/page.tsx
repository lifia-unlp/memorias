import React from 'react';
import Link from 'next/link';
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { formatCitation } from "@/lib/citations";
import { getLabName, getLabUrl } from "@/lib/config";
import { getAllTagsWithCounts } from "@/lib/tags";
import { TagCloud } from "@/components/TagCloud";

export default async function Home() {
  const labName = await getLabName();
  const labUrl = await getLabUrl();

  // Query featured publications (no limit, all marked featured, newest edits first)
  const featuredPublications = await prisma.publication.findMany({
    where: { featured: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Query featured theses (all marked featured, newest edits first)
  const featuredTheses = await prisma.thesis.findMany({
    where: { featured: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Query featured projects (all marked featured, newest edits first)
  const featuredProjects = await prisma.project.findMany({
    where: { featured: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Load welcome configuration with defensive optional chaining for cached Prisma clients
  const titleOption = await (prisma as any).systemSetting?.findUnique({ where: { key: "welcome_title" } }).catch(() => null);
  const subtitleOption = await (prisma as any).systemSetting?.findUnique({ where: { key: "welcome_subtitle" } }).catch(() => null);
  const welcomeTitle = titleOption?.value || "Welcome to Memorias";
  const welcomeSubtitle =
    subtitleOption?.value ||
    "A state-of-the-art research repository and laboratory management portal. Discover publications, explore active research projects, and access defended theses.";

  // Fetch tag cloud metadata
  const tags = await getAllTagsWithCounts();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Unified Header */}
      <Header />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-12 animate-fadeIn">
        {/* Welcome Section */}
        <section className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-850 dark:text-white">
            {welcomeTitle}
          </h1>
          <p className="text-lg text-muted max-w-2xl leading-relaxed">
            {welcomeSubtitle}
          </p>
        </section>

        {/* Dynamic Interactive Tag Cloud */}
        <section className="animate-in fade-in slide-in-from-top-3 duration-300">
          <TagCloud tags={tags} limit={40} />
        </section>

        {/* 1. Featured Publications (Full Width) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
              Featured Publications
            </h2>
            <Link href="/publications" className="text-xs font-bold text-primary hover:underline">
              Browse All Publications →
            </Link>
          </div>

          {featuredPublications.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-border rounded-2xl text-xs text-muted font-medium">
              No publications have been featured yet. Editors can select featured records from the publication manager.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4.5">
              {featuredPublications.map((pub) => {
                const citation = formatCitation(pub, "apa");
                return (
                  <div
                    key={pub.id}
                    className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-750 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded">
                          Featured Publication
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Year {pub.year}
                        </span>
                      </div>
                      <Link
                        href={`/publications/${pub.slug}`}
                        className="font-extrabold text-base text-slate-850 dark:text-slate-100 hover:text-primary hover:underline block leading-snug"
                      >
                        {pub.title}
                      </Link>
                      <div
                        className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: citation.html }}
                      />
                    </div>
                    <Link
                      href={`/publications/${pub.slug}`}
                      className="px-5 py-2.5 rounded-xl border border-border hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs text-slate-750 dark:text-slate-200 transition-all text-center self-start md:self-center cursor-pointer shrink-0"
                    >
                      View Citation Details
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Featured Theses and Projects (Side-by-Side Layout) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Featured Theses */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                Featured Theses
              </h2>
              <Link href="/theses" className="text-xs font-bold text-secondary hover:underline">
                All Theses →
              </Link>
            </div>

            {featuredTheses.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-border rounded-2xl text-xs text-muted font-medium">
                No academic theses flagged as featured yet.
              </div>
            ) : (
              <div className="space-y-4">
                {featuredTheses.map((thesis) => (
                  <div
                    key={thesis.id}
                    className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-750 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        {thesis.level && (
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/10">
                            {thesis.level}
                          </span>
                        )}
                        {thesis.progress !== null && (
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${
                            thesis.progress === 100
                              ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:text-green-500"
                              : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-500"
                          }`}>
                            {thesis.progress === 100 ? "Completed" : `${thesis.progress}%`}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/theses/${thesis.slug}`}
                        className="font-bold text-sm text-slate-800 dark:text-slate-100 hover:text-primary hover:underline transition-all block leading-snug line-clamp-2"
                      >
                        {thesis.title}
                      </Link>
                    </div>

                    <div className="text-[11px] text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-border/60">
                      {thesis.student && <div><strong>Student:</strong> {thesis.student}</div>}
                      {thesis.director && <div className="mt-0.5"><strong>Director:</strong> {thesis.director}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Featured Projects */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                Featured Projects
              </h2>
              <Link href="/projects" className="text-xs font-bold text-secondary hover:underline">
                All Projects →
              </Link>
            </div>

            {featuredProjects.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-border rounded-2xl text-xs text-muted font-medium">
                No research projects flagged as featured yet.
              </div>
            ) : (
              <div className="space-y-4">
                {featuredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-750 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      {project.code && (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/10 inline-block">
                          {project.code}
                        </span>
                      )}
                      <Link
                        href={`/projects/${project.slug}`}
                        className="font-bold text-sm text-slate-800 dark:text-slate-100 hover:text-primary hover:underline transition-all block leading-snug line-clamp-2"
                      >
                        {project.title}
                      </Link>
                    </div>

                    <div className="text-[11px] text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-border/60">
                      {project.director && <div><strong>Director:</strong> {project.director}</div>}
                      {project.fundingAgency && <div className="mt-0.5"><strong>Funding:</strong> {project.fundingAgency}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50 py-8 text-center text-xs text-muted mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} <a href={labUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-semibold">{labName}</a>. All rights reserved. Powered by Memorias.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Semantic Web RDF</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
