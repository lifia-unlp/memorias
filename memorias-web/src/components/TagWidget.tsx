"use client";

import React, { useState, useEffect, useRef } from "react";
import { getTagsMetadata } from "@/app/admin/tags/actions";

interface TagWidgetProps {
  initialTags?: string[];
  name?: string;
  placeholder?: string;
  onChange?: (tags: string[]) => void;
}

export function TagWidget({
  initialTags = [],
  name = "tags",
  placeholder = "Type tag and press Enter or comma...",
  onChange,
}: TagWidgetProps) {
  const [tags, setTags] = useState<string[]>(() =>
    initialTags.map((t) => t.trim().toLowerCase()).filter(Boolean)
  );
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [autocompleteTags, setAutocompleteTags] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load tag suggestions client-side dynamically
  useEffect(() => {
    async function loadMetadata() {
      try {
        const meta = await getTagsMetadata();
        if (meta) {
          setPopularTags(meta.popular);
          setAutocompleteTags(meta.distinct);
        }
      } catch (err) {
        console.error("Failed to load tags autocomplete metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addTag = (tagToAdd: string) => {
    const sanitized = tagToAdd.trim().toLowerCase().replace(/\s+/g, " ");
    if (sanitized && !tags.includes(sanitized)) {
      const nextTags = [...tags, sanitized];
      setTags(nextTags);
      onChange?.(nextTags);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (indexToRemove: number) => {
    const nextTags = tags.filter((_, idx) => idx !== indexToRemove);
    setTags(nextTags);
    onChange?.(nextTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent accidental form submissions
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "," || e.key === "Tab") {
      if (e.key === ",") {
        e.preventDefault();
      }
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue) {
      // Remove last tag on Backspace if input is empty
      if (tags.length > 0) {
        removeTag(tags.length - 1);
      }
    }
  };

  // Filter autocomplete suggestions based on query
  const suggestions = autocompleteTags
    .map((t) => t.toLowerCase().trim())
    .filter(
      (t) =>
        t.includes(inputValue.toLowerCase()) &&
        !tags.includes(t) &&
        t !== inputValue.trim().toLowerCase()
    );

  const displaySuggestions = isOpen && inputValue.trim().length > 0 && suggestions.length > 0;

  return (
    <div className="space-y-3 w-full">
      {/* 1. Visual Tags Pills Container */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 border border-dashed border-border/80 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl min-h-[44px]">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-blue-300 dark:border-primary/30 transition-all select-none animate-in fade-in zoom-in-95 duration-100"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:bg-primary/20 dark:hover:bg-primary/45 rounded-full p-0.5 inline-flex items-center justify-center font-black cursor-pointer transition-colors"
                title={`Remove tag: ${tag}`}
              >
                <svg
                  className="w-2.5 h-2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 2. Text Input & AutoComplete Suggestions */}
      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border border-border px-3.5 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary bg-background text-foreground text-sm transition-all"
        />

        {/* Dynamic Autocomplete Suggestions Overlay */}
        {displaySuggestions && (
          <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1 duration-100">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-200 cursor-pointer border-b border-border/40 last:border-b-0"
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Clickable Top 10 Popular Tags Pills */}
      {popularTags.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block select-none">
            Popular Tags (Click to quick-add)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((popTag) => {
              const sanitized = popTag.trim().toLowerCase();
              const isSelected = tags.includes(sanitized);
              return (
                <button
                  key={popTag}
                  type="button"
                  disabled={isSelected}
                  onClick={() => addTag(sanitized)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-850 dark:text-slate-650 dark:border-slate-800 cursor-not-allowed"
                      : "bg-white text-slate-700 border-border hover:border-primary/45 hover:text-primary dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800 dark:hover:border-primary/45 dark:hover:text-primary shadow-sm hover:shadow"
                  }`}
                >
                  + {sanitized}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden input to pass selected tags in standard form post submissions */}
      <input type="hidden" name={name} value={tags.join(",")} />
    </div>
  );
}
