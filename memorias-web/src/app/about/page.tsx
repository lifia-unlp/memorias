import React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

// Server-side function to read and fetch ABOUT.md contents
async function getAboutContent(): Promise<string> {
  const githubUrl =
    "https://raw.githubusercontent.com/casco/memorias-migration-antigrativy/main/ABOUT.md";
  
  try {
    const res = await fetch(githubUrl, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    if (res.ok) {
      return await res.text();
    }
  } catch (error) {
    console.warn(
      "Failed to fetch ABOUT.md from GitHub, falling back to local file:",
      error
    );
  }

  // Fallback to local files in the workspace
  try {
    // 1. Try parent directory (repo root when run inside memorias-web)
    const localPath = path.join(process.cwd(), "..", "ABOUT.md");
    if (fs.existsSync(localPath)) {
      return await fs.promises.readFile(localPath, "utf-8");
    }
    // 2. Try current directory as secondary fallback
    const appPath = path.join(process.cwd(), "ABOUT.md");
    if (fs.existsSync(appPath)) {
      return await fs.promises.readFile(appPath, "utf-8");
    }
  } catch (err) {
    console.error("Failed to read local ABOUT.md:", err);
  }

  // Default hardcoded fallback in case both network and disk are inaccessible
  return `# About Memorias\n\nWelcome to Memorias, a scientific research repository and laboratory management portal. Powered by LIFIA.`;
}

// Lightweight Inline Markdown Parser for React Nodes
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  while (currentText.length > 0) {
    const boldMatch = currentText.match(/\*\*([\s\S]*?)\*\*/);
    const linkMatch = currentText.match(/\[([\s\S]*?)\]\(([\s\S]*?)\)/);
    const codeMatch = currentText.match(/`([\s\S]*?)`/);

    const boldIdx =
      boldMatch && boldMatch.index !== undefined ? boldMatch.index : Infinity;
    const linkIdx =
      linkMatch && linkMatch.index !== undefined ? linkMatch.index : Infinity;
    const codeIdx =
      codeMatch && codeMatch.index !== undefined ? codeMatch.index : Infinity;

    const minIdx = Math.min(boldIdx, linkIdx, codeIdx);

    if (minIdx === Infinity) {
      parts.push(<span key={keyIdx++}>{currentText}</span>);
      break;
    }

    if (minIdx > 0) {
      parts.push(
        <span key={keyIdx++}>{currentText.substring(0, minIdx)}</span>
      );
    }

    if (minIdx === boldIdx && boldMatch) {
      parts.push(
        <strong
          key={keyIdx++}
          className="font-extrabold text-slate-900 dark:text-white"
        >
          {boldMatch[1]}
        </strong>
      );
      currentText = currentText.substring(boldIdx + boldMatch[0].length);
    } else if (minIdx === linkIdx && linkMatch) {
      const href = linkMatch[2];
      const isInternal = href.startsWith("/");
      parts.push(
        isInternal ? (
          <Link
            key={keyIdx++}
            href={href}
            className="text-primary dark:text-amber-500 font-bold hover:underline transition-colors"
          >
            {linkMatch[1]}
          </Link>
        ) : (
          <a
            key={keyIdx++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary dark:text-amber-500 font-bold hover:underline transition-colors underline decoration-dotted underline-offset-4"
          >
            {linkMatch[1]}
          </a>
        )
      );
      currentText = currentText.substring(linkIdx + linkMatch[0].length);
    } else if (minIdx === codeIdx && codeMatch) {
      parts.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-700/50"
        >
          {codeMatch[1]}
        </code>
      );
      currentText = currentText.substring(codeIdx + codeMatch[0].length);
    }
  }

  return parts;
}

// Block-level Parser that converts markdown text to semantic, styled React nodes
function parseMarkdownToJSX(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Group list items into a single UL component
    const isListItem = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    if (currentList.length > 0 && !isListItem && trimmed !== "") {
      blocks.push(
        <ul
          key={`list-${listKey++}`}
          className="list-disc pl-6 my-5 space-y-2.5 text-sm text-slate-650 dark:text-slate-350"
        >
          {currentList}
        </ul>
      );
      currentList = [];
    }

    if (trimmed === "---") {
      blocks.push(
        <hr key={i} className="border-t border-border/80 my-8 w-full" />
      );
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h1
          key={i}
          className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white border-b border-border pb-4 mb-6 mt-4"
        >
          {parseInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={i}
          className="text-lg md:text-xl font-bold tracking-tight text-slate-850 dark:text-white mt-10 mb-4.5 flex items-center gap-2"
        >
          {parseInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3
          key={i}
          className="text-base font-bold text-slate-800 dark:text-slate-200 mt-8 mb-3"
        >
          {parseInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    if (isListItem) {
      const content = trimmed.slice(2);
      currentList.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {parseInline(content)}
        </li>
      );
      continue;
    }

    if (trimmed === "") {
      continue;
    }

    // Default: render line as a styled paragraph
    blocks.push(
      <p
        key={i}
        className="text-sm leading-relaxed text-slate-650 dark:text-slate-350 mb-4"
      >
        {parseInline(line)}
      </p>
    );
  }

  // Handle list items that were at the very end of the markdown string
  if (currentList.length > 0) {
    blocks.push(
      <ul
        key={`list-${listKey++}`}
        className="list-disc pl-6 my-5 space-y-2.5 text-sm text-slate-650 dark:text-slate-350"
      >
        {currentList}
      </ul>
    );
  }

  return blocks;
}

export default async function AboutPage() {
  const rawContent = await getAboutContent();
  const renderedElements = parseMarkdownToJSX(rawContent);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Portal Header */}
      <Header />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-14 px-6 shadow-inner relative overflow-hidden border-b border-blue-900/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto flex flex-col justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest font-black uppercase text-amber-500 bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
                System Context
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              About Memorias
            </h1>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Discover the history, objectives, and the unique agent-driven technology behind this scientific research catalog.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="bg-white dark:bg-slate-900 border border-border shadow-md rounded-3xl p-8 md:p-12 animate-in fade-in slide-in-from-top-3 duration-300">
          {/* Main Parsed Markdown Document */}
          <article className="prose dark:prose-invert max-w-none space-y-4">
            {renderedElements}
          </article>
        </div>
      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
