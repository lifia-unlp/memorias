"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  deleteTagGlobally,
  mergeTags,
  isOpenAIConfigured,
  runGlobalAutoTaggerAction,
  getTagsWithCountsAdmin,
} from "./actions";

interface TagInfo {
  tag: string;
  count: number;
}

interface TagsCurationClientProps {
  initialTags: TagInfo[];
}

export function TagsCurationClient({ initialTags }: TagsCurationClientProps) {
  const [tags, setTags] = useState<TagInfo[]>(initialTags);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // AI Auto-Tagger States
  const [isOpenAIEnabled, setIsOpenAIEnabled] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [selectedTargets, setSelectedTargets] = useState<string[]>(["publication"]);
  const [selectedMode, setSelectedMode] = useState<"skip" | "merge" | "replace">("skip");
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  // Check if OpenAI is configured in the environment on mount
  useEffect(() => {
    async function checkOpenAI() {
      try {
        const configured = await isOpenAIConfigured();
        setIsOpenAIEnabled(configured);
      } catch (err) {
        console.error("Failed to check OpenAI key configuration:", err);
      } finally {
        setCheckingConfig(false);
      }
    }
    checkOpenAI();
  }, []);

  // Active modal / action states
  const [activeRenameTag, setActiveRenameTag] = useState<TagInfo | null>(null);
  const [renameValue, setRenameValue] = useState("");
  
  const [activeMergeTag, setActiveMergeTag] = useState<TagInfo | null>(null);
  const [mergeTargetValue, setMergeTargetValue] = useState("");

  const [activeDeleteTag, setActiveDeleteTag] = useState<TagInfo | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filtered tags based on search
  const filteredTags = tags.filter((t) =>
    t.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. Delete Action Handler
  const handleDelete = (tagToDelete: string) => {
    startTransition(async () => {
      try {
        const res = await deleteTagGlobally(tagToDelete);
        if (res.success) {
          setTags((prev) => prev.filter((t) => t.tag !== tagToDelete));
          showNotification("success", `Successfully deleted tag "${tagToDelete}" globally.`);
          setActiveDeleteTag(null);
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Failed to delete tag.");
      }
    });
  };

  // 2. Rename / Edit Action Handler (Rename is technically merging the old tag name into the new one!)
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRenameTag) return;
    const target = renameValue.trim().toLowerCase();
    if (!target) return;

    startTransition(async () => {
      try {
        const res = await mergeTags(activeRenameTag.tag, target);
        if (res.success) {
          // Re-update internal state local list
          setTags((prev) => {
            const next = [...prev];
            const sourceIdx = next.findIndex((t) => t.tag === activeRenameTag.tag);
            const targetIdx = next.findIndex((t) => t.tag === target);

            if (targetIdx !== -1) {
              // Target already exists, aggregate count
              next[targetIdx].count += activeRenameTag.count;
              next.splice(sourceIdx, 1);
            } else {
              // Just rename the existing element
              next[sourceIdx].tag = target;
            }
            return next.sort((a, b) => b.count - a.count);
          });

          showNotification(
            "success",
            `Successfully renamed "${activeRenameTag.tag}" to "${target}" globally.`
          );
          setActiveRenameTag(null);
          setRenameValue("");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Failed to rename tag.");
      }
    });
  };

  // 3. Merge Action Handler
  const handleMergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMergeTag) return;
    const target = mergeTargetValue.trim().toLowerCase();
    if (!target || target === activeMergeTag.tag) return;

    startTransition(async () => {
      try {
        const res = await mergeTags(activeMergeTag.tag, target);
        if (res.success) {
          setTags((prev) => {
            const next = [...prev];
            const sourceIdx = next.findIndex((t) => t.tag === activeMergeTag.tag);
            const targetIdx = next.findIndex((t) => t.tag === target);

            if (targetIdx !== -1) {
              next[targetIdx].count += activeMergeTag.count;
            } else {
              next.push({ tag: target, count: activeMergeTag.count });
            }
            next.splice(sourceIdx, 1);
            return next.sort((a, b) => b.count - a.count);
          });

          showNotification(
            "success",
            `Successfully merged "${activeMergeTag.tag}" into "${target}" globally.`
          );
          setActiveMergeTag(null);
          setMergeTargetValue("");
        }
      } catch (err: any) {
        showNotification("error", err?.message || "Failed to merge tags.");
      }
    });
  };

  // 4. Batch Auto-Tagger Handler
  const handleRunAutoTagger = async () => {
    if (selectedTargets.length === 0) {
      showNotification("error", "Please select at least one target collection to auto-tag.");
      return;
    }

    setIsAutoTagging(true);
    showNotification("success", "Global AI Auto-Tagger initiated. Processing batch queues...");

    try {
      const res = await runGlobalAutoTaggerAction({
        model: selectedModel,
        targets: selectedTargets,
        mode: selectedMode,
      });

      if (res.success) {
        showNotification(
          "success",
          `AI Auto-Tagger finished successfully! Processed and updated: ${res.processedCount} element(s).`
        );
        // Refresh local curation tag stats list dynamically
        const updatedTags = await getTagsWithCountsAdmin();
        setTags(updatedTags);
      } else {
        showNotification("error", res.error || "Failed to execute AI Auto-Tagger.");
      }
    } catch (err: any) {
      showNotification("error", err?.message || "An unexpected error occurred during execution.");
    } finally {
      setIsAutoTagging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-355"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-355"
          }`}
        >
          <span className="text-lg">{notification.type === "success" ? "✅" : "⚠️"}</span>
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white">
              Taxonomy Curation Tools
            </h1>
          </div>
          <p className="text-xs text-muted">
            Global management portal to rename, merge synonyms, or remove classification tags.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer inline-flex items-center gap-1.5 self-start md:self-center"
        >
          ← Home Dashboard
        </Link>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Unique Keywords
          </span>
          <span className="text-3xl font-black text-primary mt-1.5 block">
            {tags.length}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Total Classifications
          </span>
          <span className="text-3xl font-black text-indigo-600 mt-1.5 block">
            {tags.reduce((sum, t) => sum + t.count, 0)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Highly Popular (5+ uses)
          </span>
          <span className="text-3xl font-black text-emerald-600 mt-1.5 block">
            {tags.filter((t) => t.count >= 5).length}
          </span>
        </div>
      </div>

      {/* OpenAI Auto-Tagger Control Card */}
      <div className="bg-gradient-to-br from-indigo-50/40 via-white to-white dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-900 border border-border rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="space-y-1">
            <h2 className="font-extrabold text-slate-800 dark:text-white text-base">
              Global AI Auto-Tagger Suite
            </h2>
            <p className="text-[11px] text-muted leading-relaxed">
              Batch seed or update taxonomy classifications across the entire laboratory database.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-800 px-3 py-1 rounded-xl">
            <div className={`w-2 h-2 rounded-full ${isAutoTagging ? "bg-amber-500 animate-pulse" : checkingConfig ? "bg-slate-400" : isOpenAIEnabled ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-[10px] font-black text-slate-650 dark:text-slate-350 uppercase tracking-wider">
              {isAutoTagging ? "Processing..." : checkingConfig ? "Checking Status..." : isOpenAIEnabled ? "OpenAI Connected" : "OpenAI Offline"}
            </span>
          </div>
        </div>

        {checkingConfig ? (
          <div className="py-6 text-center text-xs text-muted font-bold animate-pulse">Checking taxonomy tagger configuration...</div>
        ) : !isOpenAIEnabled && selectedTargets.some((t) => t !== "member") ? (
          <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-250 dark:border-amber-900/40 rounded-2xl p-5 text-left space-y-2.5">
            <h3 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">AI Classification Disabled</h3>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed max-w-2xl">
              To unlock database-wide OpenAI semantic tagging for Publications, Projects, Theses, and Scholarships, please configure the <strong>OPENAI_API_KEY</strong> environment variable in your local <code>.env</code> file and restart the development server.
            </p>
            <div className="pt-1.5 flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500">Note: You can still run local mathematical derivation for Members without an API key.</span>
            </div>
          </div>
        ) : null}

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isAutoTagging ? "opacity-50 pointer-events-none" : ""}`}>
          {/* Column 1: Targets Choice */}
          <div className="space-y-3">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              1. Target Collections
            </label>
            <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-border rounded-2xl p-4 space-y-3">
              {[
                { key: "publication", label: "Publications", desc: "Scientific abstract taxonomy" },
                { key: "project", label: "Projects", desc: "Grant summary fields" },
                { key: "thesis", label: "Theses", desc: "Dissertation summaries" },
                { key: "scholarship", label: "Scholarships", desc: "Research proposals" },
                { key: "member", label: "Members", desc: "Derives top 3 tags from outputs (Free!)" },
              ].map((item) => {
                const isSelected = selectedTargets.includes(item.key);
                return (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 cursor-pointer group select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isAutoTagging}
                      onChange={() => {
                        setSelectedTargets((prev) =>
                          isSelected ? prev.filter((t) => t !== item.key) : [...prev, item.key]
                        );
                      }}
                      className="mt-1 rounded border-border text-primary focus:ring-primary/45 cursor-pointer"
                    />
                    <div className="-mt-0.5">
                      <span className="text-xs font-bold text-slate-750 dark:text-slate-200 group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted block leading-tight">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Column 2: Parameters Choice */}
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                2. OpenAI Model
              </label>
              <select
                value={selectedModel}
                disabled={isAutoTagging || (!isOpenAIEnabled && selectedTargets.some((t) => t !== "member"))}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full border border-border px-3.5 py-2.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs font-semibold cursor-pointer"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cheap - Default)</option>
                <option value="gpt-4o">gpt-4o (High Quality)</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                3. Update Strategy
              </label>
              <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-border rounded-2xl p-4 space-y-3">
                {[
                  { key: "skip", label: "Skip existing", desc: "Only auto-tag records currently without tags." },
                  { key: "merge", label: "Merge recommendations", desc: "Keep current tags and append AI suggestions." },
                  { key: "replace", label: "Clean & Replace", desc: "Discard current tags and rewrite from scratch." },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 cursor-pointer group select-none"
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={selectedMode === item.key}
                      disabled={isAutoTagging}
                      onChange={() => setSelectedMode(item.key as any)}
                      className="mt-0.5 border-border text-primary focus:ring-primary/45 cursor-pointer"
                    />
                    <div className="-mt-0.5">
                      <span className="text-xs font-bold text-slate-750 dark:text-slate-200 group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted block leading-tight">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Summary / Trigger */}
          <div className="bg-indigo-50/15 dark:bg-slate-950/10 border border-indigo-100/50 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Tagger Summary
              </label>
              <div className="space-y-2.5 text-xs text-slate-650 dark:text-slate-350">
                <p className="leading-relaxed">
                  Executing batch run using model <strong className="text-slate-800 dark:text-white font-mono">{selectedModel}</strong>.
                </p>
                <p className="leading-relaxed">
                  Target collections: <strong className="text-slate-800 dark:text-white font-bold">{selectedTargets.length} selected</strong>.
                </p>
                <p className="leading-relaxed">
                  Strategy: <strong className="text-slate-800 dark:text-white font-bold">{selectedMode === "skip" ? "Skip tagged items" : selectedMode === "merge" ? "Merge suggestions" : "Rewrite all"}</strong>.
                </p>
                <div className="pt-1.5 border-t border-border/60">
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold leading-normal">
                    💡 OpenAI requests are batched in groups of 15 items to minimize API calls, prompt tokens, and costs.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunAutoTagger}
              disabled={
                isAutoTagging ||
                selectedTargets.length === 0 ||
                (!isOpenAIEnabled && selectedTargets.some((t) => t !== "member"))
              }
              className={`w-full mt-6 py-3 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2`}
            >
              {isAutoTagging ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running AI Tagger...
                </>
              ) : (
                "Execute Auto-Tagger"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Table */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/80 pb-4">
          <h2 className="font-extrabold text-slate-800 dark:text-white text-base self-start sm:self-center">
            Active Taxonomy Register
          </h2>
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 border border-border px-3.5 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs"
          />
        </div>

        {filteredTags.length === 0 ? (
          <div className="text-center py-16 text-xs text-muted font-medium">
            No classifications found matching search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border/60 text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">
                  <th className="py-3 px-4">Tag Reference</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4 text-right">Curation Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs font-semibold">
                {filteredTags.map((tagInfo) => (
                  <tr
                    key={tagInfo.tag}
                    className="hover:bg-slate-50/45 dark:hover:bg-slate-800/15 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border text-[11px] font-mono">
                        {tagInfo.tag}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[11px] font-black">
                        {tagInfo.count} times
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setActiveRenameTag(tagInfo);
                          setRenameValue(tagInfo.tag);
                        }}
                        disabled={isPending}
                        className="px-3 py-1.5 border border-border text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        ✏️ Rename
                      </button>
                      <button
                        onClick={() => {
                          setActiveMergeTag(tagInfo);
                          setMergeTargetValue("");
                        }}
                        disabled={isPending}
                        className="px-3 py-1.5 border border-border text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        🧬 Merge
                      </button>
                      <button
                        onClick={() => setActiveDeleteTag(tagInfo)}
                        disabled={isPending}
                        className="px-3 py-1.5 border border-border text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* Curative Action Overlays (Modals) */}
      {/* ========================================================== */}

      {/* 1. Rename Modal */}
      {activeRenameTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleRenameSubmit}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                Rename Classification Tag
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                This renames <code className="font-bold text-slate-700 dark:text-slate-350">{activeRenameTag.tag}</code> globally across all models.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                New Identifier
              </label>
              <input
                type="text"
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="e.g. artificial intelligence"
                className="w-full border border-border px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm font-semibold"
              />
              <p className="text-[10px] text-amber-600 font-bold leading-tight">
                ⚠️ Note: If the target name already exists, the tags will be merged and counts aggregated automatically.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
              <button
                type="button"
                onClick={() => {
                  setActiveRenameTag(null);
                  setRenameValue("");
                }}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !renameValue.trim() || renameValue.trim().toLowerCase() === activeRenameTag.tag}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-colors"
              >
                {isPending ? "Renaming..." : "Save Rename"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Merge Modal */}
      {activeMergeTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleMergeSubmit}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                Merge Taxonomy Tag
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                This collapses all instances of <code className="font-bold text-slate-700 dark:text-slate-350">{activeMergeTag.tag}</code> into another existing or custom tag name globally.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Target Tag Name
              </label>
              <select
                required
                value={mergeTargetValue}
                onChange={(e) => setMergeTargetValue(e.target.value)}
                className="w-full border border-border px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm font-semibold"
              >
                <option value="">Select Merge Destination...</option>
                {tags
                  .filter((t) => t.tag !== activeMergeTag.tag)
                  .map((t) => (
                    <option key={t.tag} value={t.tag}>
                      {t.tag} ({t.count} items)
                    </option>
                  ))}
              </select>
              <p className="text-[10px] text-slate-400">
                All records matching &ldquo;{activeMergeTag.tag}&rdquo; will be updated to point to the selected tag instead. Duplicate array allocations will be cleaned automatically.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
              <button
                type="button"
                onClick={() => {
                  setActiveMergeTag(null);
                  setMergeTargetValue("");
                }}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !mergeTargetValue}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-colors"
              >
                {isPending ? "Merging..." : "Complete Merge"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {activeDeleteTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <span className="text-3xl block">🚨</span>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                Delete Tag Globally?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <code className="font-mono text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">{activeDeleteTag.tag}</code>?
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                This tag will be stripped from all <strong>{activeDeleteTag.count}</strong> record(s) where it is currently used. <strong>This action is permanent and cannot be undone.</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
              <button
                type="button"
                onClick={() => setActiveDeleteTag(null)}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(activeDeleteTag.tag)}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-colors"
              >
                {isPending ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
