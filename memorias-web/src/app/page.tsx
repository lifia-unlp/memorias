import React from 'react';
import Link from 'next/link';
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { formatCitation } from "@/lib/citations";

export default async function Home() {
  // Query dynamic statistics from database
  const [memberCount, projectCount, thesisCount, publicationCount] = await Promise.all([
    prisma.member.count(),
    prisma.project.count(),
    prisma.thesis.count(),
    prisma.publication.count(),
  ]);

  const stats = [
    { label: 'Total Members', count: memberCount, icon: '👥', href: '/members' },
    { label: 'Research Projects', count: projectCount, icon: '📁', href: '/projects' },
    { label: 'Academic Theses', count: thesisCount, icon: '🎓', href: '/theses' },
    { label: 'Publications', count: publicationCount, icon: '📄', href: '/publications' },
  ];

  // Query featured theses (most recently added/updated)
  const featuredTheses = await prisma.thesis.findMany({
    take: 3,
    orderBy: {
      endDate: 'desc',
    },
  });

  // Query featured projects
  const featuredProjects = await prisma.project.findMany({
    take: 3,
    orderBy: {
      endDate: 'desc',
    },
  });

  // Query recent publications
  const recentPublications = await prisma.publication.findMany({
    take: 3,
    orderBy: {
      year: 'desc',
    },
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Unified Header */}
      <Header />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-12">
        {/* Welcome Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary">
            🚀 Technology Migration Complete (Next.js + Postgres)
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome to <span className="text-gradient-primary">Memorias</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl">
            A state-of-the-art research repository and laboratory management portal. Manage projects, track publications, archive theses, and display member metrics.
          </p>
        </section>

        {/* Dynamic Statistics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Link
              key={i}
              href={stat.href}
              className="material-card flex items-center justify-between hover:border-primary/40 transition-all cursor-pointer group"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">{stat.label}</span>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{stat.count}</h3>
              </div>
              <span className="text-3xl p-3 bg-primary/5 dark:bg-primary/20 rounded-xl group-hover:scale-110 transition-transform">{stat.icon}</span>
            </Link>
          ))}
        </section>

        {/* Main Columns Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Featured Theses & Featured Projects */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Featured Theses */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <span>🎓</span> Featured Theses
                </h2>
                <Link href="/theses" className="text-xs font-bold text-secondary hover:underline">
                  Browse All Theses →
                </Link>
              </div>

              {featuredTheses.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm text-xs text-muted italic font-medium">
                  No academic theses recorded in the database yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredTheses.map((thesis) => (
                    <div
                      key={thesis.id}
                      className="bg-white dark:bg-slate-900 border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-750 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          {thesis.level && (
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded">
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

                      <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-border/60">
                        {thesis.student && <div><strong>Student:</strong> {thesis.student}</div>}
                        {thesis.director && <div className="mt-0.5"><strong>Director:</strong> {thesis.director}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Projects */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <span>📁</span> Featured Research Projects
                </h2>
                <Link href="/projects" className="text-xs font-bold text-secondary hover:underline">
                  Browse All Projects →
                </Link>
              </div>

              {featuredProjects.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm text-xs text-muted italic font-medium">
                  No research projects recorded in the database yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white dark:bg-slate-900 border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-750 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        {project.code && (
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded inline-block">
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

                      <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-border/60">
                        {project.director && <div><strong>Director:</strong> {project.director}</div>}
                        {project.fundingAgency && <div className="mt-0.5"><strong>Funding:</strong> {project.fundingAgency}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recent Publications (Formatted in APA) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span>📚</span> Recent Publications
              </h2>
              <Link href="/publications" className="text-xs font-bold text-secondary hover:underline">
                Browse Publications →
              </Link>
            </div>

            {recentPublications.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm text-xs text-muted italic font-medium">
                No scientific publications recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {recentPublications.map((pub) => {
                  const citation = formatCitation(pub, "apa");
                  return (
                    <div
                      key={pub.id}
                      className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4.5 shadow-sm space-y-3"
                    >
                      <Link
                        href={`/publications/${pub.slug}`}
                        className="font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:text-primary hover:underline block leading-snug"
                      >
                        {pub.title}
                      </Link>
                      <div
                        className="text-[10px] text-slate-650 dark:text-slate-405 leading-relaxed bg-slate-50/50 dark:bg-slate-800/10 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80"
                        dangerouslySetInnerHTML={{ __html: citation.html }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50 py-8 text-center text-xs text-muted mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Memorias System. Open Source Migration Project.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Semantic Web RDF</a>
            <span>•</span>
            <a href="#" className="hover:underline">MCP Server API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
