import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";

type Params = Promise<{}>;
type SearchParams = Promise<{ q?: string; type?: string; status?: string; limit?: string; page?: string }>;

export default async function ScholarshipsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedSearchParams = await props.searchParams;
  const q = resolvedSearchParams.q || "";
  const type = resolvedSearchParams.type || "";
  const status = resolvedSearchParams.status || "";
  const page = parseInt(resolvedSearchParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedSearchParams.limit || "10", 10) || 10;

  // Dynamically build Prisma filter query
  const whereConditions: any = {
    AND: [],
  };

  if (type) {
    whereConditions.AND.push({ type });
  }

  const now = new Date();
  if (status === "completed") {
    whereConditions.AND.push({
      endDate: { lt: now },
    });
  } else if (status === "ongoing") {
    whereConditions.AND.push({
      OR: [
        { endDate: { gte: now } },
        { endDate: null },
      ],
    });
  }

  if (whereConditions.AND.length === 0) {
    delete whereConditions.AND;
  }

  // Fetch filtered scholarships
  const scholarships = await prisma.scholarship.findMany({
    where: whereConditions,
    orderBy: [
      { endDate: "desc" },
      { startDate: "desc" },
    ],
  });

  // Filter in memory for keyword search
  const lowerQ = q.trim().toLowerCase();
  const filteredScholarships = lowerQ
    ? scholarships.filter((s) => {
        const matchTitle = s.title.toLowerCase().includes(lowerQ);
        const matchStudent = !!(s.student && s.student.toLowerCase().includes(lowerQ));
        const matchAdvisors =
          !!((s.director && s.director.toLowerCase().includes(lowerQ)) ||
          (s.coDirector && s.coDirector.toLowerCase().includes(lowerQ)));
        const matchAgency = !!(s.fundingAgency && s.fundingAgency.toLowerCase().includes(lowerQ));
        const matchSummary = !!(s.summary && s.summary.toLowerCase().includes(lowerQ));
        const matchTags = s.tags.some((tag) =>
          tag.toLowerCase().includes(lowerQ)
        );
        return matchTitle || matchStudent || matchAdvisors || matchAgency || matchSummary || matchTags;
      })
    : scholarships;

  // Paginate final list
  const totalPages = Math.ceil(filteredScholarships.length / limit);
  const paginatedScholarships = filteredScholarships.slice((page - 1) * limit, page * limit);

  // Query types choices
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

      {/* Title Banner */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-12 px-6 shadow-inner relative overflow-hidden border-b border-blue-700/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Academic Scholarships</h1>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Explore professional fellowships, doctoral, and training scholarships funded by scientific agencies.
            </p>
          </div>
          {isEditorOrAdmin && (
            <Link
              href="/scholarships/new"
              className="bg-white hover:bg-slate-100 text-primary font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
            >
              Add Scholarship
            </Link>
          )}
        </div>
      </section>

      {/* Main Search and Grid Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        
        {/* Advanced Filters Panel */}
        <div className="bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm">
          <form method="GET" className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            <div className="relative md:col-span-4">
            <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search scholarships by student, advisors, agency or keywords..."
                className="w-full border border-border pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <select
                name="type"
                defaultValue={type}
                className="w-full border border-border px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs font-semibold"
              >
                <option value="">All Types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
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

            <div className="md:col-span-2 flex items-center gap-2">
              <select
                name="limit"
                defaultValue={limit.toString()}
                className="w-full border border-border px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs font-semibold"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="30">30 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
              >
                Filter
              </button>
              {(q || type || status || limit !== 10) && (
                <Link
                  href="/scholarships"
                  className="text-xs font-bold text-slate-500 hover:underline px-1 shrink-0"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Scholarships Grid */}
        {filteredScholarships.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No Scholarships Found</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">
              We couldn&apos;t find any scholarships matching your search filters. Try broadening your keywords.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedScholarships.map((s) => {
                const startStr = s.startDate
                  ? new Date(s.startDate).getFullYear()
                  : "N/D";
                const isCompleted = s.endDate && new Date(s.endDate) < now;
                const endStr = s.endDate
                  ? new Date(s.endDate).getFullYear()
                  : "Ongoing";

                return (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col p-6 space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {s.type && (
                          <span className="text-[9px] uppercase tracking-wider font-black text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded">
                            {s.type}
                          </span>
                        )}
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${
                          isCompleted
                            ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:text-green-500 dark:border-green-950/40"
                            : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-500 dark:border-amber-950/40"
                        }`}>
                          {isCompleted ? "Completed" : "Ongoing"}
                        </span>
                      </div>
                      <Link
                        href={`/scholarships/${s.slug}`}
                        className="font-extrabold text-base text-slate-800 dark:text-slate-100 hover:text-primary transition-all block leading-snug hover:underline"
                      >
                        {s.title}
                      </Link>
                    </div>

                    {/* Details Block */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-border/80 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                        <span>Timeline:</span>
                        <span>{startStr} – {endStr}</span>
                      </div>

                      {s.student && (
                        <div className="text-slate-700 dark:text-slate-300">
                          <strong>Student:</strong> {s.student}
                        </div>
                      )}

                      {s.fundingAgency && (
                        <div className="text-slate-700 dark:text-slate-300">
                          <strong>Funding Agency:</strong> {s.fundingAgency}
                        </div>
                      )}

                      {(s.director || s.coDirector) && (
                        <div className="space-y-0.5 pt-1.5 border-t border-border mt-1.5">
                          {s.director && (
                            <div className="text-slate-700 dark:text-slate-300">
                              <strong>Director:</strong> {s.director}
                            </div>
                          )}
                          {s.coDirector && (
                            <div className="text-slate-700 dark:text-slate-300">
                              <strong>Co-Director:</strong> {s.coDirector}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Summary Snippet */}
                    {s.summary && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-3">
                        {s.summary}
                      </p>
                    )}

                    {/* Tags */}
                    {s.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {s.tags.slice(0, 4).map((tag) => (
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
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              currentSearchParams={{ q, type, status, limit }}
              baseUrl="/scholarships"
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
