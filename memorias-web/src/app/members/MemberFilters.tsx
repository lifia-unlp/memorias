"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function MemberFilters({ positions }: { positions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePositionChange = (pos: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pos) {
      params.set("position", pos);
    } else {
      params.delete("position");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center w-full bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm">
      <div className="relative flex-1 w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          defaultValue={searchParams.get("query") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search members by name, position, or tags..."
          className="w-full pl-9 pr-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
        />
      </div>
      
      <div className="w-full sm:w-64 flex items-center gap-3">
        <select
          defaultValue={searchParams.get("position") || ""}
          onChange={(e) => handlePositionChange(e.target.value)}
          className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm cursor-pointer"
        >
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
        
        {isPending && (
          <span className="text-xs text-primary font-bold animate-pulse shrink-0">
            ⏳
          </span>
        )}
      </div>
    </div>
  );
}
