import React from "react";
import { Header } from "@/components/Header";

export default function StatisticsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Unified Navigation Header */}
      <Header />

      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        
        {/* Animated Construction Vector SVG Icon (Replacing Emoji) */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-secondary/10 dark:bg-secondary/5 animate-pulse" />
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-secondary to-secondary-hover opacity-20 dark:opacity-10 animate-spin duration-10000" />
          
          <div className="relative">
            <svg className="w-12 h-12 text-secondary animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Text Headers */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
            Coming Soon
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gradient-primary dark:text-white">
            Statistics and Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            This module is currently under construction. Soon, you will be able to visualize yearly research growth, funding breakdowns, and co-authorship graphs.
          </p>
        </div>

        {/* Wireframe Mockup of Future Charts */}
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-lg border border-slate-700/50">
              Design in Progress
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Box 1 */}
            <div className="border border-border/60 rounded-xl p-4 space-y-3">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-12 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="flex gap-1 items-end h-16 pt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-[20%] rounded-sm" />
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-[50%] rounded-sm" />
                <div className="w-full bg-slate-300 dark:bg-slate-600 h-[80%] rounded-sm" />
              </div>
            </div>

            {/* Box 2 */}
            <div className="border border-border/60 rounded-xl p-4 space-y-3">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="flex gap-1 items-end h-16 pt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-[70%] rounded-sm" />
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-[40%] rounded-sm" />
                <div className="w-full bg-slate-300 dark:bg-slate-600 h-[90%] rounded-sm" />
              </div>
            </div>

            {/* Box 3 */}
            <div className="border border-border/60 rounded-xl p-4 space-y-3">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-10 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="flex gap-1 items-end h-16 pt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-[40%] rounded-sm" />
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-[80%] rounded-sm" />
                <div className="w-full bg-slate-300 dark:bg-slate-600 h-[30%] rounded-sm" />
              </div>
            </div>
          </div>

          {/* Line Chart Wireframe */}
          <div className="border border-border/60 rounded-xl p-4 space-y-4">
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="relative h-24 border-b border-l border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
              <svg className="absolute inset-x-0 bottom-0 h-16 w-full text-secondary/30" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,80 Q25,20 50,60 T100,30 L100,100 L0,100 Z" fill="currentColor" />
                <path d="M0,80 Q25,20 50,60 T100,30" fill="none" stroke="var(--secondary)" strokeWidth="3" />
              </svg>
              <div className="h-2 w-2 rounded-full bg-secondary absolute left-[25%] bottom-[75%]" />
              <div className="h-2 w-2 rounded-full bg-secondary absolute left-[50%] bottom-[35%]" />
              <div className="h-2 w-2 rounded-full bg-secondary absolute left-[75%] bottom-[65%]" />
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg"
          >
            Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
