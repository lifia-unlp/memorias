import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, signOut } from "@/auth";
import { CvTabs } from "./CvTabs";
import { DeleteMemberButton } from "./DeleteMemberButton";

type Params = Promise<{ slug: string }>;

export default async function MemberDetailPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Fetch Member
  const member = await prisma.member.findUnique({
    where: { slug },
  });

  if (!member) {
    notFound();
  }

  // 2. Fetch Projects involving this member (as Director, Co-Director, or Team Member)
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { director: member.id },
        { coDirector: member.id },
        { members: { some: { id: member.id } } },
      ],
    },
    orderBy: { startDate: "desc" },
  });

  // Helper to determine role in project
  const getProjectRole = (p: any) => {
    if (p.director === member.id) return "Director";
    if (p.coDirector === member.id) return "Co-Director";
    return "Member";
  };

  // 3. Fetch Theses involving this member
  const theses = await prisma.thesis.findMany({
    where: {
      OR: [
        { student: member.id },
        { director: member.id },
        { coDirector: member.id },
        { members: { some: { id: member.id } } },
      ],
    },
    orderBy: { startDate: "desc" },
  });

  const getThesisRole = (t: any) => {
    if (t.student === member.id) return "Student";
    if (t.director === member.id) return "Director";
    if (t.coDirector === member.id) return "Co-Director";
    return "Member";
  };

  // 4. Fetch Scholarships
  const scholarships = await prisma.scholarship.findMany({
    where: {
      OR: [
        { student: member.id },
        { director: member.id },
        { coDirector: member.id },
        { members: { some: { id: member.id } } },
      ],
    },
    orderBy: { startDate: "desc" },
  });

  // 5. Fetch Publications
  const publications = await prisma.publication.findMany({
    where: {
      members: { some: { id: member.id } },
    },
    orderBy: { year: "desc" },
  });

  // Fetch all members for fast id-to-name lookup
  const allMembers = await prisma.member.findMany({
    select: { id: true, firstName: true, lastName: true },
  });
  const memberMap = new Map(
    allMembers.map((m) => [m.id, `${m.firstName} ${m.lastName}`])
  );

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

      {/* Main Layout Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Profile Card & Contacts */}
        <section className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            {/* Design bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />

            <div className="text-center space-y-4 pt-2">
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatarUrl}
                  alt={`${member.firstName} avatar`}
                  className="w-28 h-28 rounded-full border-2 border-primary/20 object-cover object-top mx-auto shadow-md"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center bg-primary/10 text-primary border border-primary/10 rounded-full text-5xl mx-auto shadow-sm">
                  🎓
                </div>
              )}

              <div>
                <h1 className="text-xl font-black text-foreground tracking-tight leading-tight">
                  {member.firstName} {member.lastName}
                </h1>
                {member.positionAtLab && (
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest block mt-1">
                    {member.positionAtLab}
                  </span>
                )}
              </div>
            </div>

            {/* Scientific Credentials */}
            <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">
                Scientific Accreditations
              </span>
              {member.highestDegree && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">🎓</span>
                  <div>
                    <span className="font-semibold block text-foreground leading-none">Degree</span>
                    <span className="text-muted text-[10px] mt-0.5 block">{member.highestDegree}</span>
                  </div>
                </div>
              )}
              {member.positionAtCONICET && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">🔬</span>
                  <div>
                    <span className="font-semibold block text-foreground leading-none">CONICET</span>
                    <span className="text-muted text-[10px] mt-0.5 block">{member.positionAtCONICET}</span>
                  </div>
                </div>
              )}
              {member.positionAtCIC && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">🏛️</span>
                  <div>
                    <span className="font-semibold block text-foreground leading-none">CIC Position</span>
                    <span className="text-muted text-[10px] mt-0.5 block">{member.positionAtCIC}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Communication Details */}
            <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">
                Contact & Profiles
              </span>
              {member.institutionalEmail && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">✉️</span>
                  <a href={`mailto:${member.institutionalEmail}`} className="text-primary hover:underline truncate">
                    {member.institutionalEmail}
                  </a>
                </div>
              )}
              {member.personalEmail && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">✉️</span>
                  <a href={`mailto:${member.personalEmail}`} className="text-primary hover:underline truncate">
                    {member.personalEmail}
                  </a>
                </div>
              )}
              {member.webPage && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">🌐</span>
                  <a href={member.webPage} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                    Personal Web Page
                  </a>
                </div>
              )}
              {member.orcid && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">🆔</span>
                  <a href={`https://orcid.org/${member.orcid}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate font-semibold">
                    ORCID: {member.orcid}
                  </a>
                </div>
              )}
            </div>

            {/* Tags */}
            {member.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/60">
                {member.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions Panel */}
            {isEditorOrAdmin && (
              <div className="flex flex-col gap-2 pt-5 border-t border-border/60">
                <Link
                  href={`/members/${member.slug}/edit`}
                  className="bg-primary hover:bg-primary-hover text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
                >
                  📝 Edit Profile
                </Link>
                <DeleteMemberButton memberId={member.id} memberName={`${member.firstName} ${member.lastName}`} />
              </div>
            )}
          </div>
        </section>

        {/* Right Column: CV Tabs & Related Database Lists */}
        <section className="flex-1 space-y-8">
          {/* 1. Spanish/English Controlled Tabs */}
          <CvTabs
            cvEs={member.shortCvInSpanish}
            cvEn={member.shortCvInEnglish}
            interestsEs={member.interestsInSpanish}
            interestsEn={member.interestsInEnglish}
          />

          {/* 2. Associated Projects */}
          {projects.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3 flex items-center gap-2">
                <span>📁</span> Associated Projects
              </h3>
              <div className="divide-y divide-border/60">
                {projects.map((p) => (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/projects/${p.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                        {p.title}
                      </Link>
                      <span className="text-[10px] text-muted block mt-0.5">
                        {p.startDate ? new Date(p.startDate).getFullYear() : "N/A"} — {p.endDate ? new Date(p.endDate).getFullYear() : "Present"}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-secondary/15 text-secondary border border-secondary/20 rounded-lg shrink-0">
                      {getProjectRole(p)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Associated Theses */}
          {theses.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3 flex items-center gap-2">
                <span>🎓</span> Associated Theses
              </h3>
              <div className="divide-y divide-border/60">
                {theses.map((t) => (
                  <div key={t.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/theses/${t.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                        {t.title}
                      </Link>
                      <span className="text-[10px] text-muted block mt-0.5">
                        Student: {t.student ? (memberMap.get(t.student) || t.student) : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Progress bar indication */}
                      {t.progress !== undefined && (
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-border">
                            <div className="bg-secondary h-full" style={{ width: `${t.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold">{t.progress}%</span>
                        </div>
                      )}
                      <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg">
                        {getThesisRole(t)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Associated Scholarships */}
          {scholarships.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3 flex items-center gap-2">
                <span>🎫</span> Associated Scholarships
              </h3>
              <div className="divide-y divide-border/60">
                {scholarships.map((s) => (
                  <div key={s.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/scholarships/${s.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                        {s.title}
                      </Link>
                      <span className="text-[10px] text-muted block mt-0.5">
                        Funding Agency: {s.fundingAgency || "N/A"}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg shrink-0">
                      Scholar
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Associated Publications */}
          {publications.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3 flex items-center gap-2">
                <span>📚</span> Bibliography / Publications
              </h3>
              <div className="divide-y divide-border/60">
                {publications.map((pb) => (
                  <div key={pb.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                    <Link href={`/publications/${pb.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block leading-tight">
                      {pb.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted font-medium">
                      <span>{pb.authors || "N/A"}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-secondary">{pb.year}</span>
                      {pb.type && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider text-[8px]">
                            {pb.type}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
