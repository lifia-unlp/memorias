import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteScholarshipButton } from "./DeleteScholarshipButton";
import { Header } from "@/components/Header";

type Params = Promise<{ slug: string }>;

export default async function ScholarshipDetailPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const scholarship = await prisma.scholarship.findUnique({
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
      projects: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!scholarship) {
    notFound();
  }

  const startStr = scholarship.startDate
    ? new Date(scholarship.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "N/D";
  const endStr = scholarship.endDate
    ? new Date(scholarship.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Ongoing";

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
          <div className="space-y-3">
            {scholarship.type && (
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full">
                Type: {scholarship.type}
              </span>
            )}
            <h1 className="text-4xl font-extrabold tracking-tight max-w-4xl leading-tight">
              {scholarship.title}
            </h1>
            <div className="flex items-center gap-1 text-blue-100 text-xs font-semibold">
              <span>Timeline:</span>
              <span>{startStr} – {endStr}</span>
            </div>
          </div>

          {isEditorOrAdmin && (
            <div className="flex items-center gap-3">
              <Link
                href={`/scholarships/${scholarship.slug}/edit`}
                className="bg-white hover:bg-slate-100 text-primary font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center"
              >
                Edit Scholarship
              </Link>
              <DeleteScholarshipButton scholarshipId={scholarship.id} scholarshipTitle={scholarship.title} />
            </div>
          )}
        </div>
      </section>

      {/* Main content grid */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Summary and Linked Projects */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-primary border-b border-border pb-3 flex items-center gap-2">
              Scholarship Summary
            </h2>
            {scholarship.summary ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {scholarship.summary}
              </p>
            ) : (
              <div className="text-xs text-muted italic font-medium py-4 text-center">
                No description or abstract summary has been set for this scholarship.
              </div>
            )}
          </div>

          {/* Connected Projects */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-primary border-b border-border pb-3 flex items-center gap-2">
              Associated Research Projects ({scholarship.projects.length})
            </h2>
            {scholarship.projects.length === 0 ? (
              <div className="text-xs text-muted italic font-medium py-4 text-center">
                No associated research projects linked to this scholarship.
              </div>
            ) : (
              <div className="space-y-3">
                {scholarship.projects.map((proj) => (
                  <Link
                    key={proj.id}
                    href={`/projects/${proj.slug}`}
                    className="block p-4 rounded-xl border border-border hover:border-slate-350 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"
                  >
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100 block">
                      {proj.title}
                    </span>
                    <span className="text-[10px] text-muted block mt-1.5 leading-none">
                      Go to Project Space →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata Detail Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider border-b border-border pb-3">
              Scholarship Profile
            </h3>

            <div className="space-y-4 text-xs">
              {scholarship.student && (
                <div>
                  <span className="text-slate-500 font-semibold block">Scholarship Holder / Student</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">
                    {scholarship.student}
                  </span>
                </div>
              )}

              {scholarship.fundingAgency && (
                <div>
                  <span className="text-slate-500 font-semibold block">Funding Institution</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {scholarship.fundingAgency}
                  </span>
                </div>
              )}

              {scholarship.director && (
                <div>
                  <span className="text-slate-500 font-semibold block">Director</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">
                    {scholarship.director}
                  </span>
                </div>
              )}

              {scholarship.coDirector && (
                <div>
                  <span className="text-slate-500 font-semibold block">Co-Director</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mt-0.5">
                    {scholarship.coDirector}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Associated Lab Researchers */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider border-b border-border pb-3">
              Associated Members ({scholarship.members.length})
            </h3>
            {scholarship.members.length === 0 ? (
              <div className="text-xs text-muted italic font-medium py-2 text-center">
                No connected researchers.
              </div>
            ) : (
              <div className="space-y-3">
                {scholarship.members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.slug}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-border/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all block"
                  >
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatarUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="h-8 w-8 rounded-full object-cover border border-border bg-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-border flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                        {member.firstName[0]}
                        {member.lastName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate leading-tight">
                        {member.firstName} {member.lastName}
                      </span>
                      <span className="text-[10px] text-muted block truncate mt-0.5">
                        {member.positionAtLab || "Researcher"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tags cloud */}
          {scholarship.tags.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider border-b border-border pb-2.5">
                Research Areas
              </h3>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {scholarship.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-3 py-1 rounded-xl text-xs font-semibold"
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
