"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SUPPORTED_STYLES } from "@/lib/citations";

interface CitationStyleSelectorProps {
  initialStyle: string;
}

export function CitationStyleSelector({ initialStyle }: CitationStyleSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("style", newStyle);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        Format:
      </label>
      <select
        value={initialStyle}
        onChange={handleChange}
        className="px-2 py-1 text-[11px] font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg focus:outline-none text-slate-700 dark:text-slate-350 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-900"
      >
        {SUPPORTED_STYLES.map((st) => (
          <option key={st.value} value={st.value}>
            {st.label}
          </option>
        ))}
      </select>
    </div>
  );
}
