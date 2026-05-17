import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CvTabs } from "./CvTabs";
import { DeleteMemberButton } from "./DeleteMemberButton";
import { Header } from "@/components/Header";

type Params = Promise<{ slug: string }>;

function getBibtexString(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    return val.map(getBibtexString).join(" ");
  }
  if (typeof val === "object") {
    if (val.value !== undefined) {
      return getBibtexString(val.value);
    }
    return getBibtexString(val.text || val.name || val.label || JSON.stringify(val));
  }
  return String(val);
}

function formatAPA(pb: any): string {
  try {
    const bib = pb.bibtexData;
    if (!bib || typeof bib !== "object") {
      return `${pb.authors}. (${pb.year}). ${pb.title}.`;
    }

    const tags = (bib as any).entryTags || (bib as any).tags || bib;
    
    let authorsStr = pb.authors || getBibtexString(tags.author) || getBibtexString(tags.authors) || "";
    if (authorsStr) {
      const authorList = authorsStr.split(/\s+and\s+/i);
      const formattedAuthors = authorList.map((auth: string) => {
        const parts = auth.trim().split(",");
        if (parts.length === 2) {
          const last = parts[0].trim();
          const firstParts = parts[1].trim().split(/\s+/);
          const initials = firstParts.map(f => `${f.charAt(0).toUpperCase()}.`).join(" ");
          return `${last}, ${initials}`;
        } else {
          const names = auth.trim().split(/\s+/);
          if (names.length > 1) {
            const last = names[names.length - 1];
            const firstInitials = names.slice(0, names.length - 1).map(n => `${n.charAt(0).toUpperCase()}.`).join(" ");
            return `${last}, ${firstInitials}`;
          }
          return auth.trim();
        }
      });
      
      if (formattedAuthors.length > 1) {
        const lastAuth = formattedAuthors.pop();
        authorsStr = `${formattedAuthors.join(", ")} & ${lastAuth}`;
      } else {
        authorsStr = formattedAuthors[0] || "";
      }
    }

    const title = getBibtexString(tags.title) || pb.title || "";
    const year = getBibtexString(tags.year) || pb.year || "";
    const entryType = getBibtexString((bib as any).entryType || (bib as any).type || pb.type || "").toLowerCase();

    let citation = `${authorsStr} (${year}). ${title}. `;

    if (entryType === "article") {
      const journal = getBibtexString(tags.journal) || getBibtexString(tags.journaltitle) || "";
      const volume = getBibtexString(tags.volume) || "";
      const number = getBibtexString(tags.number) || "";
      const pages = getBibtexString(tags.pages) || "";
      if (journal) citation += `<em>${journal}</em>`;
      if (volume) citation += `, <em>${volume}</em>`;
      if (number) citation += `(${number})`;
      if (pages) citation += `, ${pages}`;
      citation += ".";
    } else if (entryType === "inproceedings" || entryType === "conference" || entryType === "inbook") {
      const booktitle = getBibtexString(tags.booktitle) || "";
      const pages = getBibtexString(tags.pages) || "";
      const publisher = getBibtexString(tags.publisher) || "";
      if (booktitle) citation += `In <em>${booktitle}</em>`;
      if (pages) citation += ` (pp. ${pages})`;
      if (publisher) citation += `. ${publisher}`;
      citation += ".";
    } else if (entryType === "book") {
      const publisher = getBibtexString(tags.publisher) || "";
      const address = getBibtexString(tags.address) || "";
      citation = `${authorsStr} (${year}). <em>${title}</em>. `;
      if (address) citation += `${address}: `;
      if (publisher) citation += `${publisher}.`;
    } else if (entryType === "phdthesis" || entryType === "mastersthesis") {
      const school = getBibtexString(tags.school) || "";
      const typeLabel = entryType === "phdthesis" ? "Doctoral dissertation" : "Master's thesis";
      citation += `(${typeLabel}, ${school}).`;
    } else {
      const howpublished = getBibtexString(tags.howpublished) || "";
      const note = getBibtexString(tags.note) || "";
      if (howpublished) citation += `${howpublished}. `;
      if (note) citation += `${note}.`;
    }

    return citation;
  } catch (err) {
    return `${pb.authors}. (${pb.year}). ${pb.title}.`;
  }
}

function jsonToBibtex(pb: any): string {
  try {
    const bib = pb.bibtexData;
    if (!bib || typeof bib !== "object") return "";
    const citationKey = (bib as any).citationKey || (bib as any).key || pb.slug || "citation";
    const entryType = (bib as any).entryType || (bib as any).type || pb.type || "article";
    const tags = (bib as any).entryTags || (bib as any).tags || bib;
    
    let str = `@${entryType}{${citationKey},\n`;
    for (const [k, v] of Object.entries(tags)) {
      if (k !== "citationKey" && k !== "entryType" && k !== "tags" && k !== "entryTags") {
        const cleanVal = getBibtexString(v);
        str += `  ${k} = {${cleanVal}},\n`;
      }
    }
    str += `}`;
    return str;
  } catch (e) {
    return "";
  }
}

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



  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Unified Navigation Header */}
      <Header activeTab="members" />

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
                {projects.map((p) => {
                  const role = getProjectRole(p);
                  const dirName = p.director;
                  const coDirName = p.coDirector;
                  return (
                    <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div>
                        <Link href={`/projects/${p.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                          {p.title}
                        </Link>
                        <span className="text-[10px] text-muted block mt-0.5 leading-relaxed">
                          {p.startDate ? new Date(p.startDate).getFullYear() : "N/A"} — {p.endDate ? new Date(p.endDate).getFullYear() : "Present"}
                          {(dirName || coDirName) && (
                            <span className="block mt-1 font-medium text-slate-500">
                              {dirName && `Director: ${dirName}`}
                              {dirName && coDirName && " | "}
                              {coDirName && `Co-Director: ${coDirName}`}
                            </span>
                          )}
                        </span>
                      </div>
                      {(role === "Director" || role === "Co-Director") && (
                        <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-secondary/15 text-secondary border border-secondary/20 rounded-lg shrink-0">
                          {role}
                        </span>
                      )}
                    </div>
                  );
                })}
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
                {theses.map((t) => {
                  const tRole = getThesisRole(t);
                  const tDirName = t.director;
                  const tCoDirName = t.coDirector;
                  return (
                    <div key={t.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div>
                        <Link href={`/theses/${t.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                          {t.title}
                        </Link>
                        <span className="text-[10px] text-muted block mt-0.5 leading-relaxed">
                          Student: {t.student || "N/A"}
                          <span className="block mt-1">
                            {t.startDate ? new Date(t.startDate).getFullYear() : "N/A"} — {t.endDate ? new Date(t.endDate).getFullYear() : "Present"}
                            {t.level && (
                              <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                {t.level}
                              </span>
                            )}
                          </span>
                          {(tDirName || tCoDirName) && (
                            <span className="block mt-1 font-medium text-slate-500">
                              {tDirName && `Director: ${tDirName}`}
                              {tDirName && tCoDirName && " | "}
                              {tCoDirName && `Co-Director: ${tCoDirName}`}
                            </span>
                          )}
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
                        {(tRole === "Director" || tRole === "Co-Director") && (
                          <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg">
                            {tRole}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                {scholarships.map((s) => {
                  const sDirName = s.director;
                  const sCoDirName = s.coDirector;
                  return (
                    <div key={s.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div>
                        <Link href={`/scholarships/${s.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                          {s.title}
                        </Link>
                        <span className="text-[10px] text-muted block mt-0.5 leading-relaxed">
                          Funding Agency: {s.fundingAgency || "N/A"}
                          <span className="block mt-1">
                            {s.startDate ? new Date(s.startDate).getFullYear() : "N/A"} — {s.endDate ? new Date(s.endDate).getFullYear() : "Present"}
                            {s.type && (
                              <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                {s.type}
                              </span>
                            )}
                          </span>
                          {s.student && (
                            <span className="block mt-1 font-medium text-slate-500">
                              Student: {s.student}
                            </span>
                          )}
                          {(sDirName || sCoDirName) && (
                            <span className="block mt-1 font-medium text-slate-500">
                              {sDirName && `Director: ${sDirName}`}
                              {sDirName && sCoDirName && " | "}
                              {sCoDirName && `Co-Director: ${sCoDirName}`}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                {publications.map((pb) => {
                  const hasBibtex = pb.bibtexData && typeof pb.bibtexData === "object" && Object.keys(pb.bibtexData).length > 0;
                  const bibString = jsonToBibtex(pb);
                  const bibDownloadUrl = bibString ? `data:text/plain;charset=utf-8,${encodeURIComponent(bibString)}` : "";
                  return (
                    <div key={pb.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                      <Link href={`/publications/${pb.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block leading-tight">
                        {pb.title}
                      </Link>
                      {hasBibtex ? (
                        <div
                          className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-serif bg-slate-50/50 dark:bg-slate-800/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-805"
                          dangerouslySetInnerHTML={{ __html: formatAPA(pb) }}
                        />
                      ) : (
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
                      )}
                      
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        {hasBibtex && bibDownloadUrl && (
                          <a
                            href={bibDownloadUrl}
                            download={`${pb.slug}.bib`}
                            className="text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                          >
                            📥 Download BibTeX
                          </a>
                        )}
                        {pb.selfArchivingUrl && (
                          <a
                            href={pb.selfArchivingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-secondary hover:text-secondary-hover flex items-center gap-1 cursor-pointer"
                          >
                            📄 Self-Archived PDF
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
