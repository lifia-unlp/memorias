import React from "react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentSearchParams: Record<string, string | number | string[] | undefined>;
  baseUrl: string;
}

export function Pagination({
  currentPage,
  totalPages,
  currentSearchParams,
  baseUrl,
}: PaginationProps) {
  // If there's 1 or fewer pages, pagination is unnecessary
  if (totalPages <= 1) return null;

  // Helper to build URL with preserved search parameters
  const createPageLink = (page: number) => {
    const params = new URLSearchParams();

    Object.entries(currentSearchParams).forEach(([key, value]) => {
      // Exclude 'page' to override it, and filter out undefined/null values
      if (value !== undefined && value !== null && key !== "page") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    params.set("page", page.toString());
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Generate page ranges with collapsing ellipsis (e.g. 1, 2, ..., 5, 6)
  const range: (number | string)[] = [];
  const delta = 1; // Number of pages to show around current page
  const left = currentPage - delta;
  const right = currentPage + delta + 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= left && i < right)
    ) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
      {/* Informative counter */}
      <span className="text-slate-500 dark:text-slate-400">
        Page <span className="text-slate-800 dark:text-slate-200">{currentPage}</span> of{" "}
        <span className="text-slate-800 dark:text-slate-200">{totalPages}</span>
      </span>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={createPageLink(currentPage - 1)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            ← Previous
          </Link>
        ) : (
          <span className="px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-900/60 bg-slate-100/60 dark:bg-slate-850/40 text-slate-400 dark:text-slate-650 cursor-not-allowed select-none">
            ← Previous
          </span>
        )}

        {/* Page Buttons */}
        {range.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="w-9 h-9 flex items-center justify-center text-slate-400 dark:text-slate-600 select-none font-bold"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <Link
              key={page}
              href={createPageLink(page as number)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                isCurrent
                  ? "bg-primary text-white shadow-sm ring-1 ring-primary/20 scale-105 font-bold"
                  : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 font-bold"
              }`}
            >
              {page}
            </Link>
          );
        })}

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={createPageLink(currentPage + 1)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            Next →
          </Link>
        ) : (
          <span className="px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-900/60 bg-slate-100/60 dark:bg-slate-850/40 text-slate-400 dark:text-slate-650 cursor-not-allowed select-none">
            Next →
          </span>
        )}
      </div>
    </div>
  );
}
