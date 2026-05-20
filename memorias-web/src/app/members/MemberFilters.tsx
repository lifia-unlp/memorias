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
    params.delete("page"); // Reset page offset on filter change
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
    params.delete("page"); // Reset page offset on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleLimitChange = (limit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (limit && limit !== "10") {
      params.set("limit", limit);
    } else {
      params.delete("limit");
    }
    params.delete("page"); // Reset page offset on limit change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center w-full bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm">
      <div className="relative flex-1 w-full">
        <input
          type="text"
          defaultValue={searchParams.get("query") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search members by name, position, or tags..."
          className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
        />
      </div>
      
      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-48">
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
        </div>

        <div className="w-full sm:w-40">
          <select
            defaultValue={searchParams.get("limit") || "10"}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm cursor-pointer font-medium"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="30">30 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
        
        {isPending && (
          <span className="text-xs text-primary font-bold animate-pulse shrink-0">
            Loading...
          </span>
        )}
      </div>
    </div>
  );
}
