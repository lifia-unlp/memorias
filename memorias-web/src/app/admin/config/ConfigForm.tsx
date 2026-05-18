"use client";

import React, { useState, useTransition } from "react";
import { saveSystemSettings } from "./actions";

interface ConfigFormProps {
  initialTitle: string;
  initialSubtitle: string;
  initialLogoUrl: string;
}

export function ConfigForm({
  initialTitle,
  initialSubtitle,
  initialLogoUrl,
}: ConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  const [welcomeTitle, setWelcomeTitle] = useState(initialTitle);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(initialSubtitle);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotification(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await saveSystemSettings(formData);
        setNotification({
          type: "success",
          message: "System configuration saved successfully!",
        });
      } catch (err: any) {
        setNotification({
          type: "error",
          message: err.message || "Failed to update configuration settings.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-16">
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50"
              : "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50"
          }`}
        >
          <span>{notification.type === "success" ? "✓" : "🚫"}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. Logo & Portal Branding Card */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-primary">Portal Branding & Identity</h3>
            <p className="text-[10px] text-muted">Configure the logo appearing in the navigation header.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo Live Preview */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Logo Preview</span>
            <div className="relative w-24 h-24 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-border shadow-inner overflow-hidden">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Live Logo Preview"
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Fallback to error graphic if URL is broken
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-80">
                  <circle cx="50" cy="50" r="15" fill="none" stroke="var(--secondary)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="var(--secondary)" strokeWidth="6" strokeDasharray="10 8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="4" />
                </svg>
              )}
            </div>
          </div>

          {/* Logo URL Input */}
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Logo Image URL
            </label>
            <input
              type="text"
              name="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="e.g. /my-lab-logo.png or https://example.com/logo.svg"
              className="w-full border border-border px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm font-semibold"
            />
            <p className="text-[10px] text-muted leading-relaxed">
              Provide an absolute path relative to the public folder (e.g. `/images/logo.svg`) or an external URL. Leave blank to restore the default premium vector wave logo.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Welcome & Introduction Card */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3">
          Landing Page Welcome Area
        </h3>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Welcome Title *
            </label>
            <input
              type="text"
              name="welcomeTitle"
              required
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              placeholder="Welcome to Memorias"
              className="w-full border border-border px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Welcome Subtitle & Description *
            </label>
            <textarea
              name="welcomeSubtitle"
              required
              value={welcomeSubtitle}
              onChange={(e) => setWelcomeSubtitle(e.target.value)}
              placeholder="Provide a detailed introductory bio for the laboratory dashboard..."
              className="w-full border border-border px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-36 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isPending ? "Saving Settings..." : "Save Configuration"}
        </button>
      </div>
    </form>
  );
}
