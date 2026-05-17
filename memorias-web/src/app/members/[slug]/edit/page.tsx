import React from "react";
import { auth, signOut } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MemberForm } from "../../MemberForm";

type Params = Promise<{ slug: string }>;

export default async function EditMemberPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const member = await prisma.member.findUnique({
    where: { slug },
  });

  if (!member) {
    notFound();
  }

  if (!isEditorOrAdmin) {
    redirect(`/members/${slug}`);
  }

  // Fetch all database configurable lists options
  const systemOptions = await prisma.systemOption.findMany({
    orderBy: { value: "asc" },
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
            
            {session && (
              <div className="flex items-center gap-4 pl-4 border-l border-border">
                {session.user?.role === "ADMIN" && (
                  <>
                    <Link
                      href="/admin/users"
                      className="text-xs font-bold text-secondary hover:text-secondary-hover transition-colors flex items-center gap-1"
                    >
                      ⚙️ Users Admin
                    </Link>
                    <Link
                      href="/admin/lists"
                      className="text-xs font-bold text-primary hover:text-primary-hover transition-colors mr-2 flex items-center gap-1"
                    >
                      📋 Lists Admin
                    </Link>
                  </>
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
        <div className="max-w-4xl mx-auto space-y-2 relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Edit Profile: {member.firstName} {member.lastName}
          </h1>
          <p className="text-blue-100 max-w-xl text-sm">
            Modify research categorizations, accreditations, web identifiers, and bilingual short-cv biographies.
          </p>
        </div>
      </section>

      {/* Form Area */}
      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1">
        <MemberForm initialData={member} systemOptions={systemOptions} />
      </main>
    </div>
  );
}
