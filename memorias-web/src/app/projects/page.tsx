import React from "react";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Params = Promise<{}>;
type SearchParams = Promise<{ q?: string }>;

export default async function ProjectsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedSearchParams = await props.searchParams;
  const q = resolvedSearchParams.q || "";

  // Query projects based on search text
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { director: { contains: q, mode: "insensitive" } },
        { coDirector: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { fundingAgency: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      members: {
        select: {
          firstName: true,
          lastName: true,
          slug: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Premium Navigation Header */}
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
              <Link href="/projects" className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-extrabold transition-all">
                📁 Projects
              </Link>
              {isEditorOrAdmin && session?.user?.role === "ADMIN" && (
                <>
                  <Link href="/admin/users" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    ⚙️ Users Admin
                  </Link>
                  <Link href="/admin/lists" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    📋 Lists Admin
                  </Link>
                </>
              )}
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
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">LIFIA Research Projects</h1>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Explore scientific investigations, research initiatives, and technology transfers engineered by our lab.
            </p>
          </div>
          {isEditorOrAdmin && (
            <Link
              href="/projects/new"
              className="bg-white hover:bg-slate-100 text-primary font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center"
            >
              ✨ Add Project
            </Link>
          )}
        </div>
      </section>

      {/* Main Search and Grid Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        {/* Inline Search Bar Form */}
        <div className="bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4">
          <form method="GET" className="w-full flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search projects by title, code, director, summary or keywords..."
                className="w-full border border-border pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Filter
            </button>
            {q && (
              <Link
                href="/projects"
                className="text-xs font-bold text-slate-500 hover:underline px-2"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm space-y-3">
            <span className="text-4xl block">📁</span>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No Projects Found</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">
              We couldn't find any projects matching your search query. Try broadening your keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const startStr = project.startDate
                ? new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                : "N/D";
              const endStr = project.endDate
                ? new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                : "Ongoing";

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="font-extrabold text-base text-slate-800 dark:text-slate-100 hover:text-primary transition-all block leading-snug hover:underline"
                      >
                        {project.title}
                      </Link>
                      {project.code && (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded mt-1.5 inline-block">
                          Code: {project.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates & Directors Block */}
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-border/80 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <span>📅</span>
                      <span>{startStr} – {endStr}</span>
                    </div>
                    {(project.director || project.coDirector) && (
                      <div className="space-y-0.5 pt-1.5 border-t border-border mt-1.5">
                        {project.director && (
                          <div className="text-slate-700 dark:text-slate-300">
                            <strong>Director:</strong> {project.director}
                          </div>
                        )}
                        {project.coDirector && (
                          <div className="text-slate-700 dark:text-slate-300">
                            <strong>Co-Director:</strong> {project.coDirector}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary Snippet */}
                  {project.summary && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-3">
                      {project.summary}
                    </p>
                  )}

                  {/* Associated Members as links */}
                  {project.members.length > 0 && (
                    <div className="text-xs border-t border-border pt-3.5 space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">
                        Associated Members:
                      </span>
                      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-primary">
                        {project.members.map((member, i) => (
                          <React.Fragment key={member.slug}>
                            <Link
                              href={`/members/${member.slug}`}
                              className="font-semibold hover:underline"
                            >
                              {member.firstName} {member.lastName}
                            </Link>
                            {i < project.members.length - 1 && <span className="text-slate-400">,</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
