import React from "react";
import Link from "next/link";

interface TagWithCount {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tags: TagWithCount[];
  limit?: number;
}

export function TagCloud({ tags, limit = 40 }: TagCloudProps) {
  const visibleTags = tags.slice(0, limit);

  if (visibleTags.length === 0) {
    return null;
  }

  // Find min/max counts for weight calculations
  const counts = visibleTags.map((t) => t.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const spread = maxCount - minCount || 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">
            Explore by Research Topic
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Click on a keyword to discover all related laboratory works and members.
          </p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-border">
          {tags.length} Total Topics
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5 justify-center py-4 px-2">
        {visibleTags.map(({ tag, count }) => {
          // Normalize count between 0 and 1
          const weight = (count - minCount) / spread;

          // HSL tailors:
          // Hue: 215 (gorgeous deep blue)
          // Saturation: higher weight = more saturated (45% to 85%)
          // Lightness: higher weight = darker in light mode / brighter in dark mode
          const saturation = Math.round(45 + weight * 40);
          
          // Generate font-size classes based on weight
          let fontSize = "text-xs";
          if (weight > 0.8) fontSize = "text-base md:text-lg font-black";
          else if (weight > 0.5) fontSize = "text-sm md:text-base font-extrabold";
          else if (weight > 0.2) fontSize = "text-xs md:text-sm font-bold";
          else fontSize = "text-[11px] md:text-xs font-semibold";

          return (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              style={{
                borderColor: `hsla(215, ${saturation}%, 50%, 0.25)`,
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-50/50 hover:bg-primary/5 dark:bg-slate-950/20 dark:hover:bg-primary/10 transition-all duration-200 shadow-sm hover:shadow hover:scale-105 hover:-translate-y-0.5 cursor-pointer ${fontSize}`}
              title={`${count} items tagged with '${tag}'`}
            >
              <span
                style={{
                  color: `hsl(215, ${saturation}%, 42%)`,
                }}
                className="dark:text-blue-300"
              >
                {tag}
              </span>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-black">
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
