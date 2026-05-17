import React from "react";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { DeleteProjectButton } from "./DeleteProjectButton";

type Params = Promise<{ slug: string }>;

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Query project and all its deep relationships
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
          avatarUrl: true,
          positionAtLab: true,
        },
      },
      theses: {
        select: {
          id: true,
          title: true,
          slug: true,
          student: true,
          level: true,
        },
      },
      scholarships: {
        select: {
          id: true,
          title: true,
          slug: true,
          student: true,
          type: true,
        },
      },
      publications: {
        select: {
          id: true,
          title: true,
          slug: true,
          year: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const startStr = project.startDate
    ? new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "N/D";
  const endStr = project.endDate
    ? new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Ongoing";

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-base font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-all"
            >
              🚀 LIFIA Portal
            </Link>
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Link href="/members" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                👥 Members
              </Link>
              <Link href="/projects" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                📁 Projects
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {session.user?.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    ⚡ {session.user?.role}
                  </span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-xl border border-border transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-xs font-bold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Decorative Title Banner */}
      <section className="relative overflow-hidden bg-primary text-white py-12 px-6 shadow-inner border-b border-blue-700">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            {project.code && (
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full">
                Code: {project.code}
              </span>
            )}
            <h1 className="text-4xl font-extrabold tracking-tight max-w-4xl leading-tight">
              {project.title}
            </h1>
            <div className="flex items-center gap-1 text-blue-100 text-xs font-semibold">
              <span>📅</span>
              <span>{startStr} – {endStr}</span>
            </div>
          </div>

          {isEditorOrAdmin && (
            <div className="flex items-center gap-3">
              <Link
                href={`/projects/${project.slug}/edit`}
                className="bg-white hover:bg-slate-100 text-primary font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center"
              >
                ✏️ Edit Project
              </Link>
              <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
            </div>
          )}
        </div>
      </section>

      {/* Main content split grid */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Abstract Summary & Relations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Abstract summary */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-primary border-b border-border pb-3 flex items-center gap-2">
              <span>📝</span> Project Abstract
            </h2>
            {project.summary ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {project.summary}
              </p>
            ) : (
              <div className="text-xs text-muted italic font-medium py-4 text-center">
                No description or abstract summary has been set for this project.
              </div>
            )}
          </div>

          {/* Associated Members */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-primary border-b border-border pb-3 flex items-center gap-2">
              <span>👥</span> Associated Members ({project.members.length})
            </h2>
            {project.members.length === 0 ? (
              <div className="text-xs text-muted italic font-medium py-4 text-center">
                No associated researchers linked to this project.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.slug}`}
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-border hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="h-10 w-10 rounded-full object-cover border border-border bg-slate-100"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-border flex items-center justify-center text-sm font-bold font-mono">
                        {member.firstName[0]}
                        {member.lastName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                        {member.firstName} {member.lastName}
                      </span>
                      <span className="text-[10px] text-muted block truncate">
                        {member.positionAtLab || "Researcher"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Deep Relations: Theses, Scholarships, Publications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Theses */}
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-primary border-b border-border pb-3 flex items-center gap-2">
                <span>🎓</span> Linked Theses ({project.theses.length})
              </h2>
              {project.theses.length === 0 ? (
                <span className="text-xs text-muted block italic text-center py-4">No associated theses.</span>
              ) : (
                <div className="space-y-2.5">
                  {project.theses.map((thesis) => (
                    <Link
                      key={thesis.id}
                      href={`/theses/${thesis.slug}`}
                      className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block line-clamp-1">
                        {thesis.title}
                      </span>
                      <span className="text-[10px] text-muted block mt-1">
                        Student: {thesis.student || "N/D"} • {thesis.level || "Grade"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Scholarships */}
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-primary border-b border-border pb-3 flex items-center gap-2">
                <span>🎫</span> Linked Scholarships ({project.scholarships.length})
              </h2>
              {project.scholarships.length === 0 ? (
                <span className="text-xs text-muted block italic text-center py-4">No associated scholarships.</span>
              ) : (
                <div className="space-y-2.5">
                  {project.scholarships.map((sch) => (
                    <Link
                      key={sch.id}
                      href={`/scholarships/${sch.slug}`}
                      className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block line-clamp-1">
                        {sch.title}
                      </span>
                      <span className="text-[10px] text-muted block mt-1">
                        Student: {sch.student || "N/D"} • {sch.type || "Scholarship"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Publications */}
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4 md:col-span-2">
              <h2 className="text-base font-extrabold text-primary border-b border-border pb-3 flex items-center gap-2">
                <span>📚</span> Associated Publications ({project.publications.length})
              </h2>
              {project.publications.length === 0 ? (
                <span className="text-xs text-muted block italic text-center py-4">No associated papers or publications.</span>
              ) : (
                <div className="space-y-2.5">
                  {project.publications.map((pub) => (
                    <Link
                      key={pub.id}
                      href={`/publications/${pub.slug}`}
                      className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                        📄 {pub.title}
                      </span>
                      <span className="text-[10px] text-muted block mt-1">
                        Published Year: {pub.year || "N/D"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata Detail Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider border-b border-border pb-3">
              Project Details
            </h3>

            <div className="space-y-4 text-xs">
              {project.director && (
                <div>
                  <span className="text-slate-500 font-semibold block">Director</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">
                    👤 {project.director}
                  </span>
                </div>
              )}

              {project.coDirector && (
                <div>
                  <span className="text-slate-500 font-semibold block">Co-Director</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">
                    👥 {project.coDirector}
                  </span>
                </div>
              )}

              {project.fundingAgency && (
                <div>
                  <span className="text-slate-500 font-semibold block">Funding Agency</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    🏢 {project.fundingAgency}
                  </span>
                </div>
              )}

              {project.amount && (
                <div>
                  <span className="text-slate-500 font-semibold block">Funding Amount</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    💰 {project.amount}
                  </span>
                </div>
              )}

              {project.responsibleGroup && (
                <div>
                  <span className="text-slate-500 font-semibold block">Responsible Group</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    🛡️ {project.responsibleGroup}
                  </span>
                </div>
              )}

              {project.website && (
                <div>
                  <span className="text-slate-500 font-semibold block">Project Website</span>
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary hover:underline block mt-0.5 truncate"
                  >
                    🌐 Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tags cloud */}
          {project.tags.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider border-b border-border pb-2.5">
                Research Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-xl text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
