"use client";

import React, { useState } from "react";
import { createOption, checkOptionUsage, deleteOptionSafe } from "./actions";

interface SystemOption {
  id: string;
  listName: string;
  value: string;
}

const LISTS = [
  { id: "positionAtLab", title: "Lab Positions", desc: "Allowed role tags inside the laboratory." },
  { id: "positionAtUnlp", title: "UNLP Positions", desc: "Ranks at the Universidad Nacional de La Plata." },
  { id: "positionAtCIC", title: "CIC Positions", desc: "Rank categories within the CIC body." },
  { id: "positionAtCONICET", title: "CONICET Positions", desc: "Official researcher ranks in CONICET." },
  { id: "thesisLevel", title: "Thesis Levels", desc: "Academic degrees (e.g. PhD, Masters, Grade)." },
  { id: "scholarshipType", title: "Scholarship Types", desc: "Categories of fellowships and funding grants." },
];

export default function ListDashboardClient({
  initialOptions,
}: {
  initialOptions: SystemOption[];
}) {
  const [options, setOptions] = useState<SystemOption[]>(initialOptions);
  const [activeTab, setActiveTab] = useState("positionAtLab");
  const [searchQuery, setSearchQuery] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Reassignment Modal State
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deletingOption, setDeletingOption] = useState<SystemOption | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [replacementValue, setReplacementValue] = useState("clear_value");
  const [isDeleting, setIsDeleting] = useState(false);

  const activeMetadata = LISTS.find((l) => l.id === activeTab)!;

  // Filter options for the active tab and search query
  const activeOptions = options
    .filter((o) => o.listName === activeTab)
    .filter((o) => o.value.toLowerCase().includes(searchQuery.toLowerCase()));

  // Other options in the same list (available for replacement)
  const availableReplacements = options
    .filter((o) => o.listName === activeTab && o.id !== deletingOption?.id)
    .map((o) => o.value);

  // Add Option
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const val = newValue.trim();
    if (!val) return;

    setIsSubmitting(true);
    const res = await createOption(activeTab, val);
    setIsSubmitting(false);

    if (res.success && res.option) {
      setOptions((prev) => [...prev, res.option!].sort((a, b) => a.value.localeCompare(b.value)));
      setNewValue("");
    } else {
      setFormError(res.error || "Failed to create option");
    }
  };

  // Delete Clicked
  const handleDeleteClick = async (option: SystemOption) => {
    setDeletingOption(option);
    setIsCheckingUsage(true);
    setFormError("");

    // Check if the value is in use
    const res = await checkOptionUsage(option.listName, option.value);
    setIsCheckingUsage(false);

    if (res.success) {
      if (res.count > 0) {
        setUsageCount(res.count);
        setReplacementValue("clear_value");
        setShowModal(true);
      } else {
        // Direct safe delete since usage count is 0
        if (confirm(`Are you sure you want to delete "${option.value}"?`)) {
          setIsDeleting(true);
          const delRes = await deleteOptionSafe(option.id, null);
          setIsDeleting(false);
          if (delRes.success) {
            setOptions((prev) => prev.filter((o) => o.id !== option.id));
          } else {
            alert(delRes.error || "Failed to delete option");
          }
        }
      }
    } else {
      alert(res.error || "Failed to check option usage");
    }
  };

  // Confirm delete with reassignment modal
  const handleConfirmDelete = async () => {
    if (!deletingOption) return;

    setIsDeleting(true);
    const repVal = replacementValue === "clear_value" ? null : replacementValue;
    const res = await deleteOptionSafe(deletingOption.id, repVal);
    setIsDeleting(false);

    if (res.success) {
      setOptions((prev) => prev.filter((o) => o.id !== deletingOption.id));
      setShowModal(false);
      setDeletingOption(null);
    } else {
      alert(res.error || "Failed to safely delete option");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Category Switcher Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">Select List Category</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {LISTS.map((list) => {
            const isActive = activeTab === list.id;
            return (
              <button
                key={list.id}
                onClick={() => {
                  setActiveTab(list.id);
                  setSearchQuery("");
                  setFormError("");
                  setNewValue("");
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                    : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border-border text-foreground"
                }`}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate leading-tight">{list.title}</span>
                  <span className={`text-[9px] block truncate mt-0.5 ${isActive ? "text-white/80" : "text-muted"}`}>
                    {list.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. List Control Area */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Top Active Bar */}
        <div className="bg-slate-50/50 dark:bg-slate-800/20 px-6 py-5 border-b border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-extrabold text-lg text-primary flex items-center gap-2">
              {activeMetadata.title}
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              {activeMetadata.desc}
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-border rounded-xl w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
            <span className="absolute left-3 top-3 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Option Creation Form */}
        <form onSubmit={handleAdd} className="p-6 border-b border-border/60 bg-slate-50/20 dark:bg-slate-800/5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Add new option to ${activeMetadata.title}...`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-white dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newValue.trim()}
              className="px-5 py-2.5 bg-secondary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-secondary-hover shadow-sm transition-all disabled:opacity-50 shrink-0"
            >
              {isSubmitting ? "Adding..." : "Add Option"}
            </button>
          </div>
          {formError && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 animate-pulse">
              <span>Error:</span> {formError}
            </p>
          )}
        </form>

        {/* Options Grid */}
        <div className="p-6">
          {activeOptions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <span className="text-3xl font-bold text-slate-300"></span>
              <p className="text-xs text-muted font-medium">
                {searchQuery ? "No matching options found." : "No options defined yet in this category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-border/60 rounded-xl hover:shadow-sm transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                    {opt.value}
                  </span>
                  <button
                    onClick={() => handleDeleteClick(opt)}
                    disabled={isCheckingUsage}
                    className="text-xs text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    title="Delete Option"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Reassignment & Deletion Modal */}
      {showModal && deletingOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60 transition-opacity animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-2xl p-7 max-w-md w-full scale-100 transform transition-all space-y-6">
            {/* Warning Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                  High Usage Warning
                </h3>
                <p className="text-[11px] text-slate-400">
                  Safe relational checks active.
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-border/80">
              The option <strong className="text-amber-500 font-bold">"{deletingOption.value}"</strong> is currently used by <strong className="text-slate-850 dark:text-white font-extrabold">{usageCount}</strong> database records. Deleting it directly would orphan these fields. Please specify how to update these records:
            </p>

            {/* Selection Form */}
            <div className="space-y-4">
              {/* Replace Usage option */}
              {availableReplacements.length > 0 && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="replacement_option"
                    checked={replacementValue !== "clear_value"}
                    onChange={() => setReplacementValue(availableReplacements[0])}
                    className="mt-1 focus:ring-primary accent-primary"
                  />
                  <div className="flex-1 space-y-2">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Reassign and replace usages with another option:
                    </span>
                    <select
                      value={replacementValue === "clear_value" ? availableReplacements[0] : replacementValue}
                      onChange={(e) => setReplacementValue(e.target.value)}
                      disabled={replacementValue === "clear_value"}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 text-foreground"
                    >
                      {availableReplacements.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              )}

              {/* Clear Usage option */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="replacement_option"
                  checked={replacementValue === "clear_value"}
                  onChange={() => setReplacementValue("clear_value")}
                  className="mt-1 focus:ring-primary accent-primary"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Clear and set all usages to empty/null
                  </span>
                  <p className="text-[10px] text-muted mt-0.5 leading-normal">
                    This leaves the position/level field empty on the {usageCount} referencing records.
                  </p>
                </div>
              </label>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeletingOption(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-red-500/10 hover:shadow-red-500/20"
              >
                {isDeleting ? "Updating..." : "Apply & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
