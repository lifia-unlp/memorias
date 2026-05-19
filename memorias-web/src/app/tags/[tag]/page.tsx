import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { formatCitation } from "@/lib/citations";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default async function TagDetailsPage({ params }: TagPageProps) {
  const { tag: rawTag } = await params;
  const decodedTag = decodeURIComponent(rawTag).trim().toLowerCase();

  if (!decodedTag) {
    return notFound();
  }

  // Fetch all related entities sequentially
  const members = await prisma.member.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const projects = await prisma.project.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: { title: "asc" },
  });

  const theses = await prisma.thesis.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: { title: "asc" },
  });

  const scholarships = await prisma.scholarship.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: { title: "asc" },
  });

  const publications = await prisma.publication.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: { year: "desc" },
  });

  const totalMatches =
    members.length +
    projects.length +
    theses.length +
    scholarships.length +
    publications.length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-10 animate-fadeIn">
        {/* Navigation Breadcrumb & Page Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white capitalize">
                Topic: {decodedTag}
              </h1>
              <p className="text-xs text-muted mt-1">
                Unified directory of all items matching this research classification.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-border px-4 py-2 rounded-2xl shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 self-start sm:self-center shrink-0">
              {totalMatches} {totalMatches === 1 ? "Linked Entry" : "Linked Entries"}
            </div>
          </div>
        </div>

        {totalMatches === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-border rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
              No entries found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no items classified under &ldquo;{decodedTag}&rdquo; in our repository.
            </p>
            <Link
              href="/"
              className="inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-primary-hover shadow transition-all"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1. Associated Laboratory Members */}
            {members.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-primary">
                  Laboratory Members ({members.length})
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl divide-y divide-border/60 overflow-hidden shadow-sm">
                  {members.map((member) => (
                    <Link
                      key={member.id}
                      href={`/members/${member.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition-colors group"
                    >
                      {member.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatarUrl}
                          alt={`${member.firstName} avatar`}
                          className="h-10 w-10 rounded-full border border-border object-cover object-top shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-border/80 flex items-center justify-center text-sm font-bold shrink-0">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-primary group-hover:underline transition-all block">
                          {member.firstName} {member.lastName}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded">
                            {member.positionAtLab || "Lab Researcher"}
                          </span>
                          {member.tags.slice(0, 5).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-100 dark:border-blue-950/30"
                            >
                              #{t}
                            </span>
                          ))}
                          {member.tags.length > 5 && (
                            <span className="text-[9px] text-muted font-bold">
                              +{member.tags.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        View Profile
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Active & Defended Research Projects */}
            {projects.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-primary">
                  Research Projects ({projects.length})
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl divide-y divide-border/60 overflow-hidden shadow-sm">
                  {projects.map((proj) => (
                    <Link
                      key={proj.id}
                      href={`/projects/${proj.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-primary group-hover:underline transition-all block truncate">
                          {proj.title}
                        </span>
                        <span className="text-[10px] text-muted block truncate mt-0.5">
                          {proj.code ? `Code: ${proj.code} | ` : ""}Director: {proj.director || "Not Specified"}
                        </span>
                      </div>
                      <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore Project
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Dissertations & Thesis Projects */}
            {theses.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-primary">
                  Academic Theses ({theses.length})
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl divide-y divide-border/60 overflow-hidden shadow-sm">
                  {theses.map((thesis) => (
                    <Link
                      key={thesis.id}
                      href={`/theses/${thesis.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-primary group-hover:underline transition-all block line-clamp-1">
                          {thesis.title}
                        </span>
                        <span className="text-[10px] text-muted block truncate mt-0.5">
                          {thesis.level ? `${thesis.level} | ` : ""}Student: {thesis.student || "Not Specified"}
                        </span>
                      </div>
                      <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        View Thesis
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Active Grants & Scholarships */}
            {scholarships.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-primary">
                  Research Scholarships ({scholarships.length})
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl divide-y divide-border/60 overflow-hidden shadow-sm">
                  {scholarships.map((sch) => (
                    <Link
                      key={sch.id}
                      href={`/scholarships/${sch.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-primary group-hover:underline transition-all block truncate">
                          {sch.title}
                        </span>
                        <span className="text-[10px] text-muted block truncate mt-0.5">
                          {sch.type || "Scholarship"} | Student: {sch.student || "Not Specified"}
                        </span>
                      </div>
                      <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        View Scholarship
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Scientific Publications */}
            {publications.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-primary">
                  Scientific Bibliography ({publications.length})
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl divide-y divide-border/60 overflow-hidden shadow-sm">
                  {publications.map((pub) => {
                    const citation = formatCitation(pub, "apa");
                    return (
                      <Link
                        key={pub.id}
                        href={`/publications/${pub.slug}`}
                        className="flex items-start gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition-colors group"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-primary group-hover:underline transition-all block leading-snug">
                            {pub.title}
                          </span>
                          <div
                            className="text-[11px] text-slate-650 dark:text-slate-400 font-medium"
                            dangerouslySetInnerHTML={{ __html: citation.html }}
                          />
                        </div>
                        <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                          View Paper
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
