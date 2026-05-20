import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PreferencesPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Unified Navigation Header */}
      <Header />

      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
        {/* Animated Construction Vector SVG Icon (Replacing Emoji) */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-primary/10 dark:bg-primary/5 animate-pulse" />
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-primary to-primary-hover opacity-20 dark:opacity-10 animate-spin duration-10000" />
          
          <div className="relative">
            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Text Headers */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Coming Soon
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-850 dark:text-white">
            User Preferences
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            This module is currently under construction. Soon, you will be able to customize your personal workspace theme, notifications, display formats, and export options.
          </p>
        </div>

        {/* Wireframe Mockup of Future Settings */}
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-lg border border-slate-700/50">
              Settings Panel Preview
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="space-y-1 text-left">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-6 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            </div>

            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="space-y-1 text-left">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-56 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-6 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            </div>

            <div className="flex items-center justify-between pb-1">
              <div className="space-y-1 text-left">
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
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

      <Footer />
    </div>
  );
}
