"use client";

import React, { useState, useEffect } from "react";
import { createProject, updateProject } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  positionAtLab: string | null;
}

interface ProjectFormProps {
  initialData?: any;
  members: Member[];
}

export function ProjectForm({ initialData, members }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Core States
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugOverridden, setIsSlugOverridden] = useState(
    initialData ? true : false
  );
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);

  // Members selection state
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialData?.members?.map((m: any) => m.id) || []
  );
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Auto-generate slug when title changes, unless overridden
  useEffect(() => {
    if (!isSlugOverridden) {
      const generated = title
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [title, isSlugOverridden]);

  // Toggle member checked
  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    // Explicitly set the checked members
    formData.delete("members");
    selectedMemberIds.forEach((id) => formData.append("members", id));
    formData.set("featured", String(featured));

    try {
      if (initialData) {
        await updateProject(initialData.id, formData);
        router.push(`/projects/${formData.get("slug")}`);
      } else {
        await createProject(formData);
        router.push("/projects");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered members by search
  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName}`
      .toLowerCase()
      .includes(memberSearchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-16">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>🚫</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Core Profile Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3">
          Core Project Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Project Title *</label>
            <input
              type="text"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Collaborative Knowledge Management Systems"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>SEO Slug *</span>
              {!isSlugOverridden && (
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                  ✨ Auto-Generated
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setIsSlugOverridden(true);
                  setSlug(e.target.value);
                }}
                placeholder="e.g. collaborative-knowledge-systems"
                className="w-full border border-border pl-3 pr-24 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSlugOverridden(false);
                  const generated = title
                    .toLowerCase()
                    .trim()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                  setSlug(generated);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-border cursor-pointer transition-all"
              >
                Reset Auto
              </button>
            </div>
            <p className="text-[10px] text-muted leading-relaxed">
              Generates the URL `/projects/[slug]` for this project. Custom slugs are maintained unless reset.
            </p>
          </div>

          {/* Featured Project Switcher */}
          <div className="md:col-span-2 flex items-center gap-3 bg-primary/5 dark:bg-primary/10 border border-primary/10 p-4 rounded-xl">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
            />
            <div>
              <label htmlFor="featured" className="block text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                ⭐ Featured Project
              </label>
              <span className="block text-[10px] text-muted leading-tight mt-0.5">
                Highlight this project on the home page as part of the selected scientific research feed.
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Project Code</label>
            <input
              type="text"
              name="code"
              defaultValue={initialData?.code || ""}
              placeholder="e.g. I110, PIN-2026"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Responsible Group</label>
            <input
              type="text"
              name="responsibleGroup"
              defaultValue={initialData?.responsibleGroup || ""}
              placeholder="e.g. LIFIA, Grupo I+D"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Start Date *</label>
            <input
              type="date"
              name="startDate"
              required
              defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : ""}
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">End Date *</label>
            <input
              type="date"
              name="endDate"
              required
              defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""}
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Management and Agency info */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3">
          Funding & Administration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Director Name</label>
            <input
              type="text"
              name="director"
              defaultValue={initialData?.director || ""}
              placeholder="e.g. Alejandro Fernandez"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Co-Director Name</label>
            <input
              type="text"
              name="coDirector"
              defaultValue={initialData?.coDirector || ""}
              placeholder="e.g. Jose Delle Ville"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Funding Agency</label>
            <input
              type="text"
              name="fundingAgency"
              defaultValue={initialData?.fundingAgency || ""}
              placeholder="e.g. UNLP, CONICET, ANPCyT"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Funding Amount</label>
            <input
              type="text"
              name="amount"
              defaultValue={initialData?.amount || ""}
              placeholder="e.g. $5,000,000 ARS"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Project Website Link</label>
            <input
              type="url"
              name="website"
              defaultValue={initialData?.website || ""}
              placeholder="e.g. https://lifia.info.unlp.edu.ar/projects/..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Associated Members Multi-Selection */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <div className="border-b border-border pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-lg text-primary">Associate Members</h3>
            <p className="text-[10px] text-muted">Select researchers associated with this project.</p>
          </div>
          
          <input
            type="text"
            placeholder="🔍 Search members..."
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            className="border border-border px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-xs w-full md:w-64"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted font-medium bg-slate-50 dark:bg-slate-950 rounded-xl border border-border">
            No researchers found matching search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-72 overflow-y-auto pr-2">
            {filteredMembers.map((member) => {
              const isChecked = selectedMemberIds.includes(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleMember(member.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    isChecked
                      ? "bg-primary/5 border-primary ring-1 ring-primary"
                      : "bg-surface border-border hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="h-8 w-8 rounded-full object-cover border border-border bg-slate-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-border flex items-center justify-center text-xs font-bold font-mono">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-[10px] text-muted block truncate">
                      {member.positionAtLab || "Researcher"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Rich Abstract Summary & Tagging */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3">
          Summary & Classification
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Project Abstract/Summary</label>
            <textarea
              name="summary"
              defaultValue={initialData?.summary || ""}
              placeholder="Provide a detailed overview of the research scope, objectives, and findings..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-48"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Classification Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              defaultValue={initialData?.tags ? initialData.tags.join(", ") : ""}
              placeholder="e.g. HCI, Knowledge Management, Collaborative Learning"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href={initialData ? `/projects/${initialData.slug}` : "/projects"}
          className="px-6 py-3 rounded-xl border border-border text-slate-700 hover:bg-slate-100 transition-all font-bold text-sm cursor-pointer"
        >
          Cancel
        </Link>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isSubmitting ? "Saving Project..." : initialData ? "Save Changes" : "Create Project"}
        </button>
      </div>
    </form>
  );
}
