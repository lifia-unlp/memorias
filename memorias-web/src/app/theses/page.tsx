import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Header } from "@/components/Header";

type Params = Promise<{}>;
type SearchParams = Promise<{ q?: string; level?: string; status?: string }>;

export default async function ThesesPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedSearchParams = await props.searchParams;
  const q = resolvedSearchParams.q || "";
  const level = resolvedSearchParams.level || "";
  const status = resolvedSearchParams.status || "";

  // Dynamically build Prisma filter query
  const whereConditions: any = {
    AND: [],
  };

  if (q) {
    whereConditions.AND.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { student: { contains: q, mode: "insensitive" } },
        { director: { contains: q, mode: "insensitive" } },
        { coDirector: { contains: q, mode: "insensitive" } },
        { career: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (level) {
    whereConditions.AND.push({ level });
  }

  if (status === "completed") {
    whereConditions.AND.push({ progress: 100 });
  } else if (status === "ongoing") {
    whereConditions.AND.push({
      OR: [
        { progress: { lt: 100 } },
        { progress: null },
      ],
    });
  }

  if (whereConditions.AND.length === 0) {
    delete whereConditions.AND;
  }

  // Fetch filtered theses
  const theses = await prisma.thesis.findMany({
    where: whereConditions,
    orderBy: [
      { endDate: "desc" },
      { startDate: "desc" },
    ],
  });

  // Query levels choices
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

      {/* Title Banner */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-12 px-6 shadow-inner relative overflow-hidden border-b border-blue-700/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Academic Theses</h1>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Explore doctoral, master, and graduation theses developed and directed within our research laboratory.
            </p>
          </div>
          {isEditorOrAdmin && (
            <Link
              href="/theses/new"
              className="bg-white hover:bg-slate-100 text-primary font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
            >
              ✨ Add Thesis
            </Link>
          )}
        </div>
      </section>

      {/* Main Search and Grid Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        
        {/* Advanced Filters Panel */}
        <div className="bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm">
          <form method="GET" className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            <div className="relative md:col-span-6">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search theses by title, student, advisor, career..."
                className="w-full border border-border pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs"
              />
            </div>

            <div className="md:col-span-2.5 flex items-center gap-2">
              <select
                name="level"
                defaultValue={level}
                className="w-full border border-border px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs font-semibold"
              >
                <option value="">All Levels</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2.5 flex items-center gap-2">
              <select
                name="status"
                defaultValue={status}
                className="w-full border border-border px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-center gap-3">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
              >
                Filter
              </button>
              {(q || level || status) && (
                <Link
                  href="/theses"
                  className="text-xs font-bold text-slate-500 hover:underline px-1 shrink-0"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Theses Grid */}
        {theses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm space-y-3">
            <span className="text-4xl block">🎓</span>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No Theses Found</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">
              We couldn't find any theses matching your search filters. Try broadening your keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {theses.map((ths) => {
              const startStr = ths.startDate
                ? new Date(ths.startDate).getFullYear()
                : "N/D";
              const endStr = ths.endDate
                ? new Date(ths.endDate).getFullYear()
                : ths.progress === 100
                ? "Completed"
                : "Ongoing";

              return (
                <div
                  key={ths.id}
                  className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col p-6 space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {ths.level && (
                        <span className="text-[9px] uppercase tracking-wider font-black text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded">
                          {ths.level}
                        </span>
                      )}
                      {ths.progress !== null && (
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${
                          ths.progress === 100
                            ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:text-green-500 dark:border-green-950/40"
                            : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-500 dark:border-amber-950/40"
                        }`}>
                          {ths.progress === 100 ? "Completed" : `${ths.progress}% Progress`}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/theses/${ths.slug}`}
                      className="font-extrabold text-base text-slate-800 dark:text-slate-100 hover:text-primary transition-all block leading-snug hover:underline"
                    >
                      {ths.title}
                    </Link>
                  </div>

                  {/* Details Block */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-border/80 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                      <span>📅 Timeline:</span>
                      <span>{startStr} – {endStr}</span>
                    </div>

                    {ths.student && (
                      <div className="text-slate-700 dark:text-slate-300">
                        <strong>Student:</strong> {ths.student}
                      </div>
                    )}

                    {(ths.director || ths.coDirector) && (
                      <div className="space-y-0.5 pt-1.5 border-t border-border mt-1.5">
                        {ths.director && (
                          <div className="text-slate-700 dark:text-slate-300">
                            <strong>Director:</strong> {ths.director}
                          </div>
                        )}
                        {ths.coDirector && (
                          <div className="text-slate-700 dark:text-slate-300">
                            <strong>Co-Director:</strong> {ths.coDirector}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary Snippet */}
                  {ths.summary && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-3">
                      {ths.summary}
                    </p>
                  )}

                  {/* Progress Milestone Bar */}
                  {ths.progress !== null && (
                    <div className="space-y-1.5 pt-1 border-t border-border/60">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Milestone Progress</span>
                        <span>{ths.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 border border-border rounded-full overflow-hidden">
                        <div className="bg-secondary h-full transition-all duration-300" style={{ width: `${ths.progress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {ths.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {ths.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold"
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
