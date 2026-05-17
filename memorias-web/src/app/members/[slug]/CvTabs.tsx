"use client";

import React, { useState } from "react";

export function CvTabs({
  cvEs,
  cvEn,
  interestsEs,
  interestsEn,
}: {
  cvEs: string | null;
  cvEn: string | null;
  interestsEs: string | null;
  interestsEn: string | null;
}) {
  const [lang, setLang] = useState<"ES" | "EN">("EN"); // Default English

  return (
    <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h3 className="font-extrabold text-lg text-primary">Biography & Interests</h3>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setLang("EN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === "EN"
                ? "bg-white dark:bg-slate-950 text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setLang("ES")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === "ES"
                ? "bg-white dark:bg-slate-950 text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-855 dark:hover:text-slate-200"
            }`}
          >
            🇪🇸 Spanish
          </button>
        </div>
      </div>

      <div className="space-y-6 leading-relaxed text-sm">
        {lang === "EN" ? (
          <>
            {cvEn ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Short CV</span>
                <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{cvEn}</p>
              </div>
            ) : (
              <p className="text-xs text-muted italic">No English biography provided.</p>
            )}

            {interestsEn && (
              <div className="space-y-2 pt-4 border-t border-border/60">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Research Interests</span>
                <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{interestsEn}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {cvEs ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Breve CV</span>
                <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{cvEs}</p>
              </div>
            ) : (
              <p className="text-xs text-muted italic">No Spanish biography provided.</p>
            )}

            {interestsEs && (
              <div className="space-y-2 pt-4 border-t border-border/60">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Intereses de Investigación</span>
                <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{interestsEs}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
