"use client";

import React, { useState } from "react";

interface CopyCitationButtonProps {
  textToCopy: string;
}

export function CopyCitationButton({ textToCopy }: CopyCitationButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy citation to clipboard"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
        copied
          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800/80 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      {copied ? (
        <>
          <svg
            className="w-3.5 h-3.5 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          <span>Copy Citation</span>
        </>
      )}
    </button>
  );
}
