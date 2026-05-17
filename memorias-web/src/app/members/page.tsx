import React from "react";
import { prisma } from "@/lib/prisma";
import { MemberFilters } from "./MemberFilters";
import Link from "next/link";
import { auth, signOut } from "@/auth";

type SearchParams = Promise<{ query?: string; position?: string }>;

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

  // Fetch distinct positions dynamically for filters
  const distinctPositions = await prisma.member.findMany({
    select: { positionAtLab: true },
    distinct: ["positionAtLab"],
  });
  const positions = distinctPositions
    .map((p) => p.positionAtLab)
    .filter(Boolean) as string[];

  // Fetch members with query filters
  const members = await prisma.member.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { positionAtLab: { contains: query, mode: "insensitive" } },
                { positionAtUnlp: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        position
          ? { positionAtLab: { equals: position } }
          : {},
      ],
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="relative w-10 h-10 flex items-center justify-center bg-primary/5 rounded-xl border border-primary/10">
                <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <circle cx="50" cy="50" r="15" fill="none" stroke="var(--secondary)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="var(--secondary)" strokeWidth="6" strokeDasharray="10 8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="4" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-primary dark:text-white">MEMORIAS</span>
                <span className="text-xs block text-muted font-medium tracking-widest uppercase">Research Portal</span>
              </div>
            </Link>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-muted">
            <Link href="/members" className="text-primary hover:text-primary transition-colors">Members</Link>
            <Link href="/projects" className="hover:text-primary transition-colors">Projects</Link>
            <Link href="/theses" className="hover:text-primary transition-colors">Theses</Link>
            <Link href="/publications" className="hover:text-primary transition-colors">Publications</Link>
            
            {session ? (
              <div className="flex items-center gap-4 pl-4 border-l border-border">
                {session.user?.role === "ADMIN" && (
                  <Link
                    href="/admin/users"
                    className="text-xs font-bold text-secondary hover:text-secondary-hover transition-colors mr-2"
                  >
                    ⚙️ Users Admin
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-border"
                    />
                  ) : (
                    <span className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-sm">
                      👤
                    </span>
                  )}
                  <div className="text-left hidden lg:block">
                    <span className="text-xs font-bold block text-foreground leading-tight truncate max-w-[120px]">
                      {session.user?.name}
                    </span>
                    <span className="text-[10px] text-muted block leading-none uppercase tracking-wider font-semibold">
                      {session.user?.role}
                    </span>
                  </div>
                </div>
                
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/auth/signin" className="btn-primary flex items-center gap-2">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-12 px-6 shadow-inner relative overflow-hidden">
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
              Meet the academics, PhD scholars, and scientific collaborators conducting pioneering research at LIFIA.
            </p>
          </div>
          {isEditorOrAdmin && (
            <Link
              href="/members/new"
              className="bg-secondary hover:bg-secondary-hover text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all self-start flex items-center gap-2"
            >
              ➕ Add Researcher
            </Link>
          )}
        </div>
      </section>

      {/* Filter and Members Grid */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 space-y-8 flex-1">
        <MemberFilters positions={positions} />

        {members.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-border rounded-2xl p-8 space-y-2">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold">No researchers found</h3>
            <p className="text-sm text-muted">
              Try adjusting your keywords or clearing the position filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m) => (
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
                      <div className="w-14 h-14 flex items-center justify-center bg-primary/10 rounded-full text-2xl shrink-0">
                        🎓
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
                        <span>🎓</span>
                        <span className="truncate">{m.highestDegree}</span>
                      </div>
                    )}
                    {m.positionAtCONICET && (
                      <div className="flex items-center gap-1">
                        <span>🔬</span>
                        <span>CONICET: {m.positionAtCONICET}</span>
                      </div>
                    )}
                    {m.institutionalEmail && (
                      <div className="flex items-center gap-1">
                        <span>✉️</span>
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
                        className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded"
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
        )}
      </main>
    </div>
  );
}
