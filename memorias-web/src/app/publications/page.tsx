import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Header } from "@/components/Header";
import { jsonToBibtex } from "@/lib/bibtex";
import { formatCitation, SUPPORTED_STYLES } from "@/lib/citations";
import { CopyCitationButton } from "./CopyCitationButton";

type Params = Promise<{}>;
type SearchParams = Promise<{ q?: string; type?: string; year?: string; style?: string }>;

export default async function PublicationsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedSearchParams = await props.searchParams;
  const q = resolvedSearchParams.q || "";
  const typeFilter = resolvedSearchParams.type || "all";
  const yearFilter = resolvedSearchParams.year || "all";
  const styleFilter = resolvedSearchParams.style || "apa";

  // Fetch unique years for filters
  const distinctYears = await prisma.publication.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  const years = distinctYears.map((d) => d.year);

  // Fetch publications based on filters
  const publications = await prisma.publication.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { authors: { contains: q, mode: "insensitive" } },
                { tags: { has: q } },
              ],
            }
          : {},
        typeFilter !== "all" ? { type: { equals: typeFilter } } : {},
        yearFilter !== "all" ? { year: { equals: parseInt(yearFilter, 10) } } : {},
      ],
    },
    orderBy: [{ year: "desc" }, { title: "asc" }],
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Unified Brand Header */}
      <Header activeTab="publications" />

      {/* Decorative Title Banner */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-12 px-6 shadow-inner relative overflow-hidden border-b border-blue-700/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">LIFIA Research Bibliography</h1>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Browse scientific publications, books, doctoral dissertations, and conference proceedings compiled by our members.
            </p>
          </div>
          {isEditorOrAdmin && (
            <Link
              href="/publications/new"
              className="bg-white hover:bg-slate-100 text-primary font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
            >
              ✨ Add Publication
            </Link>
          )}
        </div>
      </section>

      {/* Filter and Content section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        {/* Unified Search Filter bar */}
        <form
          method="GET"
          action="/publications"
          className="bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4"
        >
          <div className="flex-1 w-full relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by title, author, or tags..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white"
            />
          </div>

          <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-3">
            <select
              name="type"
              defaultValue={typeFilter}
              className="w-full sm:w-44 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-border rounded-xl focus:outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="article">Article (Journal)</option>
              <option value="inproceedings">Inproceedings (Conference)</option>
              <option value="book">Book / Monograph</option>
              <option value="phdthesis">PhD Thesis</option>
              <option value="mastersthesis">Master's Thesis</option>
              <option value="techreport">Technical Report</option>
              <option value="misc">Miscellaneous</option>
            </select>

            <select
              name="year"
              defaultValue={yearFilter}
              className="w-full sm:w-32 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-border rounded-xl focus:outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Years</option>
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            <select
              name="style"
              defaultValue={styleFilter}
              className="w-full sm:w-44 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-border rounded-xl focus:outline-none text-slate-700 dark:text-slate-200 font-medium"
            >
              {SUPPORTED_STYLES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm text-center"
            >
              Filter
            </button>
            
            {(q || typeFilter !== "all" || yearFilter !== "all" || styleFilter !== "apa") && (
              <Link
                href="/publications"
                className="w-full sm:w-auto text-center px-4 py-2.5 text-xs text-muted hover:text-slate-700 dark:hover:text-white font-bold transition-all"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Publications Bibliography Grid */}
        {publications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-border rounded-2xl p-8 space-y-2">
            <span className="text-4xl">📚</span>
            <h3 className="text-lg font-bold">No publications found</h3>
            <p className="text-sm text-muted">
              Try refining your query or clearing active dropdown filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {publications.map((pb) => {
              const citation = formatCitation(pb, styleFilter);
              const bibString = jsonToBibtex(pb);
              const bibDownloadUrl = bibString
                ? `data:text/plain;charset=utf-8,${encodeURIComponent(bibString)}`
                : null;

              return (
                <div
                  key={pb.id}
                  className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-3 flex-1">
                    {/* Dynamic Citation Line */}
                    <div
                      className="text-sm leading-relaxed text-slate-800 dark:text-slate-100"
                      dangerouslySetInnerHTML={{ __html: citation.html }}
                    />

                    {/* Meta Indicators (Type, Ranking, Tags) */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/5 text-primary">
                        {pb.type}
                      </span>
                      {pb.ranking && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          ⭐ {pb.ranking}
                        </span>
                      )}
                      {pb.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Low-case action links */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-1.5">
                      {pb.selfArchivingUrl && (
                        <a
                          href={pb.selfArchivingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-hover flex items-center gap-1 transition-all"
                        >
                          📄 Self-archived PDF
                        </a>
                      )}
                      {bibDownloadUrl && (
                        <a
                          href={bibDownloadUrl}
                          download={`${pb.slug || "citation"}.bib`}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-all"
                        >
                          📥 Download BibTeX
                        </a>
                      )}
                      <Link
                        href={`/publications/${pb.slug}`}
                        className="text-secondary hover:text-secondary-hover flex items-center gap-1 transition-all"
                      >
                        🔍 Details
                      </Link>

                      {/* Interactive Clipboard Copy */}
                      <CopyCitationButton textToCopy={citation.text} />
                    </div>
                  </div>

                  {/* Editor / Admin Controls */}
                  {isEditorOrAdmin && (
                    <div className="flex md:flex-col items-center gap-2 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4 self-stretch justify-end md:justify-start">
                      <Link
                        href={`/publications/${pb.slug}/edit`}
                        className="text-xs font-bold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-white border border-border rounded-lg px-3 py-1.5 transition-all bg-slate-50 dark:bg-slate-900"
                      >
                        ✏️ Edit
                      </Link>
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
