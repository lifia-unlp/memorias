import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { jsonToBibtex } from "@/lib/bibtex";
import { CopyBibtexButton } from "./CopyBibtexButton";
import { DeletePublicationButton } from "./DeletePublicationButton";
import { formatCitation, SUPPORTED_STYLES } from "@/lib/citations";
import { CopyCitationButton } from "../CopyCitationButton";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ style?: string }>;

export default async function PublicationDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const resolvedSearchParams = await searchParams;
  const styleFilter = resolvedSearchParams.style || "apa";

  // Query publication and related entities
  const pb = await prisma.publication.findUnique({
    where: { slug },
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
        },
      },
      projects: {
        select: {
          id: true,
          title: true,
          code: true,
          slug: true,
        },
      },
      theses: {
        select: {
          id: true,
          title: true,
          slug: true,
          student: true,
        },
      },
    },
  });

  if (!pb) {
    notFound();
  }

  const citation = formatCitation(pb, styleFilter);
  const bibString = jsonToBibtex(pb);

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
        <div className="max-w-7xl mx-auto z-10 relative">
          <span className="text-[10px] uppercase font-extrabold tracking-widest bg-white/10 px-2.5 py-1 rounded-full text-blue-100">
            {pb.type} Bibliography Profile
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 text-white leading-tight max-w-4xl">
            {pb.title}
          </h1>
        </div>
      </section>

      {/* Main Layout Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: APA formatting & BibTeX container */}
        <div className="flex-1 space-y-6">
          
          {/* Citation Style Box */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Bibliography Reference
              </h3>
              <div className="flex items-center gap-3">
                <form method="GET" className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Format:
                  </label>
                  <select
                    name="style"
                    defaultValue={styleFilter}
                    onChange={(e) => e.target.form?.submit()}
                    className="px-2 py-1 text-[11px] font-semibold bg-slate-50 dark:bg-slate-950 border border-border rounded-lg focus:outline-none text-slate-700 dark:text-slate-350 cursor-pointer"
                  >
                    {SUPPORTED_STYLES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </form>
                <CopyCitationButton textToCopy={citation.text} />
              </div>
            </div>
            <div
              className="text-base text-slate-800 dark:text-slate-100 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: citation.html }}
            />
          </div>

          {/* BibTeX Code Container */}
          {bibString && (
            <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm overflow-hidden">
              <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  BibTeX Source Entry
                </span>
                <CopyBibtexButton bibtex={bibString} />
              </div>
              <pre className="p-6 text-xs font-mono bg-slate-950 text-slate-300 dark:text-slate-400 overflow-x-auto whitespace-pre leading-relaxed">
                {bibString}
              </pre>
            </div>
          )}

          {/* Quick PDF Action */}
          {pb.selfArchivingUrl && (
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="block text-sm font-bold text-slate-850 dark:text-white">
                  Self-Archived Version
                </span>
                <span className="block text-xs text-slate-400">
                  Read or download the open-access publication manuscript directly.
                </span>
              </div>
              <a
                href={pb.selfArchivingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all whitespace-nowrap inline-flex items-center gap-1 cursor-pointer"
              >
                📄 Open Manuscript PDF
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Publication Details Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-border pb-3">
              Publication Details
            </h3>

            {/* Core parameters list */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-400">Publication Year</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{pb.year}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-400">Type</span>
                <span className="font-bold text-primary uppercase">{pb.type}</span>
              </div>

              {pb.ranking && (
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">Ranking / Tier</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{pb.ranking}</span>
                </div>
              )}

              {pb.tags && pb.tags.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-slate-400 block">Keywords</span>
                  <div className="flex flex-wrap gap-1.5">
                    {pb.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Associated Members */}
            {pb.members && pb.members.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4 text-xs">
                <span className="text-slate-400 font-bold block">👥 Co-Authors (Members)</span>
                <div className="space-y-1.5">
                  {pb.members.map((m) => (
                    <Link
                      key={m.id}
                      href={`/members/${m.slug}`}
                      className="block text-primary hover:underline font-medium"
                    >
                      • {m.firstName} {m.lastName}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Connected Projects */}
            {pb.projects && pb.projects.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4 text-xs">
                <span className="text-slate-400 font-bold block">📁 Connected Projects</span>
                <div className="space-y-1.5">
                  {pb.projects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.slug}`}
                      className="block text-primary hover:underline font-medium"
                    >
                      • {p.code ? `[${p.code}] ` : ""}
                      {p.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Theses */}
            {pb.theses && pb.theses.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4 text-xs">
                <span className="text-slate-400 font-bold block">🎓 Related Theses</span>
                <div className="space-y-1.5">
                  {pb.theses.map((t) => (
                    <Link
                      key={t.id}
                      href={`/theses/${t.slug}`}
                      className="block text-primary hover:underline font-medium"
                    >
                      • {t.title} {t.student ? `(${t.student})` : ""}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Edit / Delete Section */}
            {isEditorOrAdmin && (
              <div className="space-y-3 border-t border-border pt-6 mt-6">
                <Link
                  href={`/publications/${pb.slug}/edit`}
                  className="block w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-xs uppercase tracking-wider text-center cursor-pointer"
                >
                  ✏️ Edit Publication
                </Link>
                <DeletePublicationButton id={pb.id} title={pb.title} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
