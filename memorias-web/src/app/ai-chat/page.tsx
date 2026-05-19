import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { ChatClient } from "./ChatClient";

export default async function AIChatPage() {
  const session = await auth();

  const isUserActive = session?.user?.active === true;
  const userName = session?.user?.name || "Researcher";

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Universal Portal Header */}
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-8">
        {isUserActive ? (
          <ChatClient userName={userName} />
        ) : (
          /* Premium Access Denied / Sign In view for unauthenticated users */
          <div className="max-w-md w-full px-6 py-12 text-center space-y-6 bg-white dark:bg-slate-900 border border-border shadow-lg rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              🔒
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-slate-850 dark:text-white">
                Access Restricted
              </h1>
              <p className="text-xs text-muted leading-relaxed">
                The **Memorias AI Database Assistant** handles direct, real-time lookups on scientific records, projects, and auditing records.
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Please sign in with an activated portal account to continue.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/auth/signin"
                className="inline-block w-full text-center text-xs font-bold bg-primary hover:bg-primary-hover text-white py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-border bg-surface/50 py-6 text-center text-[10px] text-muted">
        <p>© {new Date().getFullYear()} Memorias Research Portal. All rights reserved. Database AI Integration.</p>
      </footer>
    </div>
  );
}
