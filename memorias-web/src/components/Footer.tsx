import React from "react";
import Link from "next/link";
import { getLabName, getLabUrl } from "@/lib/config";

export async function Footer() {
  const labName = await getLabName();
  const labUrl = await getLabUrl();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/50 py-8 text-xs text-muted mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-center md:text-left leading-relaxed">
          © {currentYear}{" "}
          <a
            href={labUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors font-semibold underline decoration-dotted underline-offset-2"
          >
            {labName}
          </a>
          . All rights reserved. Powered by{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-350">
            Memorias
          </span>
          .
        </p>
        <div className="flex items-center gap-6 font-semibold">
          <Link
            href="/about"
            className="hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>About the Portal</span>
            <span className="text-[10px] text-primary/70 dark:text-amber-500/70">
              ✨
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
