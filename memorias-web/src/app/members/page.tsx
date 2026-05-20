import React from "react";
import { prisma } from "@/lib/prisma";
import { MemberFilters } from "./MemberFilters";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { auth } from "@/auth";

type SearchParams = Promise<{ query?: string; position?: string; limit?: string; page?: string }>;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";
  const position = resolvedParams.position || "";
  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedParams.limit || "10", 10) || 10;

  // Fetch distinct positions dynamically for filters
  const distinctPositions = await prisma.member.findMany({
    select: { positionAtLab: true },
    distinct: ["positionAtLab"],
  });
  const positions = distinctPositions
    .map((p) => p.positionAtLab)
    .filter(Boolean) as string[];

  // Fetch members with position filter
  const members = await prisma.member.findMany({
    where: position ? { positionAtLab: { equals: position } } : {},
    orderBy: { lastName: "asc" },
  });

  // Filter in memory for maximum search flexibility (including case-insensitive, partial array tag matching)
  const lowerQuery = query.trim().toLowerCase();
  const filteredMembers = lowerQuery
    ? members.filter((m) => {
        const matchName =
          m.firstName.toLowerCase().includes(lowerQuery) ||
          m.lastName.toLowerCase().includes(lowerQuery);
        const matchPosition =
          (m.positionAtLab && m.positionAtLab.toLowerCase().includes(lowerQuery)) ||
          (m.positionAtUnlp && m.positionAtUnlp.toLowerCase().includes(lowerQuery));
        const matchTags = m.tags.some((tag) =>
          tag.toLowerCase().includes(lowerQuery)
        );
        return matchName || matchPosition || matchTags;
      })
    : members;

  // Paginate final list
  const totalPages = Math.ceil(filteredMembers.length / limit);
  const paginatedMembers = filteredMembers.slice((page - 1) * limit, page * limit);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Unified Header */}
      <Header activeTab="members" />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-12 px-6 shadow-inner relative overflow-hidden border-b border-blue-700/20">
        {/* Dynamic Abstract Wave */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Our Researchers</h1>
            <p className="text-blue-100 max-w-xl text-sm md:text-base">
              Meet the academics, PhD scholars, and scientific collaborators conducting pioneering research at our Lab.
            </p>
          </div>
          {isEditorOrAdmin && (
            <Link
              href="/members/new"
              className="bg-white hover:bg-slate-100 text-primary font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
            >
              Add Researcher
            </Link>
          )}
        </div>
      </section>

      {/* Filter and Members Grid */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 space-y-8 flex-1">
        <MemberFilters positions={positions} />

        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-border rounded-2xl p-8 space-y-2">
            <h3 className="text-lg font-bold">No researchers found</h3>
            <p className="text-sm text-muted">
              Try adjusting your keywords or clearing the position filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMembers.map((m) => (
                <Link
                  key={m.id}
                  href={`/members/${m.slug}`}
                  className="group bg-white dark:bg-slate-900 border border-border hover:border-primary/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Secondary Color accent bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary/30 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  
                  <div className="space-y-4">
                    {/* Photo & Identity */}
                    <div className="flex items-center gap-4">
                      {m.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.avatarUrl}
                          alt={`${m.firstName} avatar`}
                          className="w-14 h-14 rounded-full border border-border object-cover object-top shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center bg-primary/10 text-primary border border-border/10 rounded-full text-lg font-black shrink-0">
                          {m.firstName[0]}{m.lastName[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                          {m.firstName} {m.lastName}
                        </h3>
                        {m.positionAtLab && (
                          <span className="text-xs font-semibold text-secondary block mt-0.5">
                            {m.positionAtLab}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scientific Roles / Info */}
                    <div className="text-xs text-muted space-y-1.5 pt-2 border-t border-border/60">
                      {m.highestDegree && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-500">Degree:</span>
                          <span className="truncate">{m.highestDegree}</span>
                        </div>
                      )}
                      {m.positionAtCONICET && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-500">CONICET:</span>
                          <span>{m.positionAtCONICET}</span>
                        </div>
                      )}
                      {m.institutionalEmail && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-500">Email:</span>
                          <span className="truncate">{m.institutionalEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-border/40">
                      {m.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 font-semibold px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {m.tags.length > 3 && (
                        <span className="text-[9px] text-muted font-bold px-1.5 py-0.5">
                          +{m.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              currentSearchParams={{ query, position, limit }}
              baseUrl="/members"
            />
          </div>
        )}
      </main>
    </div>
  );
}
