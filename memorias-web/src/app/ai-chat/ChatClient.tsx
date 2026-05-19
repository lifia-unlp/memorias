"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { sendChatMessage } from "./actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalled?: string;
  toolResult?: any;
  toolError?: string;
}

const PRESET_QUESTIONS = [
  {
    label: "📊 Lab Summary Statistics",
    query: "Give me a high-level summary of the database: total count of members, projects, publications, defended theses, and scholarships.",
  },
  {
    label: "🎓 Defended PhD Theses",
    query: "List all PhD level theses in the database, including the student name, thesis title, director, and date completed.",
  },
  {
    label: "🏆 Member Publication Count",
    query: "Which laboratory member has the highest number of publications? Show a ranked list with their name and publication counts.",
  },
  {
    label: "🔍 AI & Machine Learning Research",
    query: "What research projects, publications, or theses are tagged with 'artificial-intelligence' or 'machine-learning'?",
  },
];

export function ChatClient({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello **${userName}**! 👋 I am the **Memorias AI Assistant**.\n\nI can answer any question about the laboratory's members, projects, publications, academic theses, scholarships, or recent activity using secure predefined lookups.\n\nTry clicking one of the sample questions below or type your own question!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showJsonIndex, setShowJsonIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Map message history to send to actions
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendChatMessage(conversationHistory);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply.content,
          toolCalled: reply.toolCalled,
          toolResult: reply.toolResult,
          toolError: reply.toolError,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an unexpected error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe and rich basic Markdown parser in React
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      // Check if it's a header
      if (line.startsWith("### ")) {
        return (
          <h4 key={lineIdx} className="text-sm font-bold mt-4 mb-2 text-slate-800 dark:text-white">
            {parseInlineStyles(line.replace("### ", ""))}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={lineIdx} className="text-base font-extrabold mt-5 mb-2.5 text-slate-800 dark:text-white">
            {parseInlineStyles(line.replace("## ", ""))}
          </h3>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={lineIdx} className="text-lg font-black mt-6 mb-3 text-slate-800 dark:text-white">
            {parseInlineStyles(line.replace("# ", ""))}
          </h2>
        );
      }

      // Check if it's a list item
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemContent = line.trim().substring(2);
        return (
          <li key={lineIdx} className="text-xs ml-4 list-disc mb-1 leading-relaxed text-slate-700 dark:text-slate-350">
            {parseInlineStyles(itemContent)}
          </li>
        );
      }

      // Check if it's a numbered list item
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <li key={lineIdx} className="text-xs ml-4 list-decimal mb-1 leading-relaxed text-slate-700 dark:text-slate-355">
            {parseInlineStyles(numMatch[2])}
          </li>
        );
      }

      // Check if it's a table row
      if (line.startsWith("|") && line.endsWith("|")) {
        // Skip separator row |---|---|
        if (line.includes("---")) return null;

        const cells = line.split("|").slice(1, -1).map(c => c.trim());
        const isHeader = lineIdx === 0 || (lines[lineIdx - 1] && lines[lineIdx - 1].includes("---")) === false && lineIdx === 1;
        
        return (
          <div key={lineIdx} className="flex border-b border-border py-2 text-xs leading-relaxed max-w-full overflow-x-auto">
            {cells.map((cell, cellIdx) => (
              <div key={cellIdx} className={`flex-1 min-w-[120px] px-2 truncate ${isHeader ? "font-bold text-primary dark:text-slate-200" : "text-slate-650 dark:text-slate-350"}`}>
                {parseInlineStyles(cell)}
              </div>
            ))}
          </div>
        );
      }

      // Default paragraph
      return line.trim() === "" ? (
        <div key={lineIdx} className="h-2" />
      ) : (
        <p key={lineIdx} className="text-xs leading-relaxed mb-2.5 text-slate-700 dark:text-slate-350">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper to parse bold (**text**), code (\`code\`), and markdown links ([text](href))
  const parseInlineStyles = (content: string) => {
    const parts: React.ReactNode[] = [];
    let currentText = content;
    let keyIdx = 0;

    while (currentText.length > 0) {
      const boldMatch = currentText.match(/\*\*([\s\S]*?)\*\*/);
      const linkMatch = currentText.match(/\[([\s\S]*?)\]\(([\s\S]*?)\)/);
      const codeMatch = currentText.match(/`([\s\S]*?)`/);

      const boldIdx = boldMatch && boldMatch.index !== undefined ? boldMatch.index : Infinity;
      const linkIdx = linkMatch && linkMatch.index !== undefined ? linkMatch.index : Infinity;
      const codeIdx = codeMatch && codeMatch.index !== undefined ? codeMatch.index : Infinity;

      const minIdx = Math.min(boldIdx, linkIdx, codeIdx);

      if (minIdx === Infinity) {
        parts.push(<span key={keyIdx++}>{currentText}</span>);
        break;
      }

      if (minIdx > 0) {
        parts.push(<span key={keyIdx++}>{currentText.substring(0, minIdx)}</span>);
      }

      if (minIdx === boldIdx && boldMatch) {
        parts.push(
          <strong key={keyIdx++} className="font-extrabold text-slate-800 dark:text-white">
            {boldMatch[1]}
          </strong>
        );
        currentText = currentText.substring(boldIdx + boldMatch[0].length);
      } else if (minIdx === linkIdx && linkMatch) {
        const isInternal = linkMatch[2].startsWith("/");
        parts.push(
          isInternal ? (
            <Link
              key={keyIdx++}
              href={linkMatch[2]}
              className="text-primary dark:text-amber-500 font-bold hover:underline"
            >
              {linkMatch[1]}
            </Link>
          ) : (
            <a
              key={keyIdx++}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary dark:text-amber-500 font-bold hover:underline"
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
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900/50">
      
      {/* Title Header Block */}
      <div className="material-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] tracking-widest font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
              Type-Safe Data Assistant
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
            Ask Memorias AI
          </h2>
          <p className="text-xs text-muted max-w-xl">
            Talk directly to your research database! Ask natural language questions about publication metrics, lab directors, defended theses, projects, or portal activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border">
            Engine: GPT-4o-Mini
          </span>
        </div>
      </div>

      {/* Main Conversation & Sidebar Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        
        {/* Left Column: Preset Queries Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-border pb-2">
              Suggested Prompts
            </h3>
            <p className="text-[11px] text-muted leading-relaxed">
              Click any of these pre-configured prompts to explore the system database in real time:
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(q.query)}
                  disabled={isLoading}
                  className="text-left text-[11px] font-semibold text-slate-700 dark:text-slate-350 p-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-4 space-y-2">
            <h4 className="text-[11px] font-black text-primary dark:text-slate-200 uppercase tracking-widest">
              🔒 Type-Safe Encapsulation
            </h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Every request executes using predefined, type-safe functions. There is zero raw SQL exposure, ensuring complete data security and total separation of concerns.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Display Box */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm overflow-hidden min-h-[450px]">
          
          {/* Messages scrollpane */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-h-[550px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Assistant Avatar */}
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary font-bold shrink-0 self-start">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 border ${
                    m.role === "user"
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 dark:bg-slate-950 border-border"
                  }`}
                >
                  {/* Message Content */}
                  <div className={m.role === "user" ? "text-xs font-medium leading-relaxed" : "space-y-2"}>
                    {m.role === "user" ? m.content : renderFormattedText(m.content)}
                  </div>

                  {/* whitelisted results previews (Collapsible) */}
                  {m.role === "assistant" && m.toolResult && (
                    <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowJsonIndex(showJsonIndex === idx ? null : idx)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-amber-500 transition-colors cursor-pointer"
                        >
                          <svg className={`w-3.5 h-3.5 transform transition-transform ${showJsonIndex === idx ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                          {showJsonIndex === idx ? "Hide Raw Database Rows" : `View Raw Records (${Array.isArray(m.toolResult) ? m.toolResult.length : '1'})`}
                        </button>
                      </div>

                      {/* Tool Error */}
                      {m.toolError && (
                        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-3 text-[10px] text-rose-600 dark:text-rose-400 leading-relaxed font-mono">
                          <strong>Lookup Error:</strong> {m.toolError}
                        </div>
                      )}

                      {/* Raw JSON Row Inspector */}
                      {showJsonIndex === idx && m.toolResult && (
                        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 overflow-x-auto max-h-48 overflow-y-auto">
                          <pre className="text-[9px] font-mono text-slate-300 block whitespace-pre">
                            {JSON.stringify(m.toolResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center text-xs font-bold font-mono text-slate-800 dark:text-slate-200 shrink-0 self-start">
                    {userName[0] || "U"}
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary font-bold shrink-0 self-start">
                  🤖
                </div>
                <div className="max-w-[85%] rounded-2xl px-4 py-3 border bg-slate-50 dark:bg-slate-950 border-border flex items-center gap-1">
                  <span className="text-[11px] text-muted font-bold mr-1">Querying database</span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form message input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(input);
            }}
            className="p-4 border-t border-border bg-slate-50 dark:bg-slate-950 flex gap-3 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question (e.g. What publications were made in 2025? Who is the lab Director?)"
              className="flex-1 text-xs px-4.5 py-3 border border-border focus:border-primary focus:outline-none bg-white dark:bg-slate-900 rounded-2xl"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-primary flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ask AI</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
