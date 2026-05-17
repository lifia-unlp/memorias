"use client";

import React, { useState } from "react";

export function CopyBibtexButton({ bibtex }: { bibtex: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400"
          : "bg-white hover:bg-slate-50 border-border text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
      }`}
    >
      {copied ? "✓ Copied!" : "📋 Copy BibTeX"}
    </button>
  );
}
