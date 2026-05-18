"use client";

import React, { useState, useEffect } from "react";
import { createMember, updateMember } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MemberFormProps {
  initialData?: any;
  systemOptions?: any[];
}

export function MemberForm({ initialData, systemOptions = [] }: MemberFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group database options
  const positionAtLabOptions = systemOptions
    .filter((o) => o.listName === "positionAtLab")
    .map((o) => o.value);
  const positionAtUnlpOptions = systemOptions
    .filter((o) => o.listName === "positionAtUnlp")
    .map((o) => o.value);
  const positionAtCICOptions = systemOptions
    .filter((o) => o.listName === "positionAtCIC")
    .map((o) => o.value);
  const positionAtCONICETOptions = systemOptions
    .filter((o) => o.listName === "positionAtCONICET")
    .map((o) => o.value);

  // Form States
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugOverridden, setIsSlugOverridden] = useState(
    initialData ? true : false
  );

  // Auto-generate slug when name changes, unless overridden
  useEffect(() => {
    if (!isSlugOverridden) {
      const generated = `${firstName} ${lastName}`
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [firstName, lastName, isSlugOverridden]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    try {
      if (initialData) {
        await updateMember(initialData.id, formData);
        router.push(`/members/${formData.get("slug")}`);
      } else {
        await createMember(formData);
        router.push("/members");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save member profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Core Profile Info
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">First Name *</label>
            <input
              type="text"
              name="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Alejandro"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Last Name *</label>
            <input
              type="text"
              name="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Fernandez"
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
                placeholder="e.g. alejandro-fernandez"
                className="w-full border border-border pl-3 pr-24 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSlugOverridden(false);
                  // Trigger reset
                  const generated = `${firstName} ${lastName}`
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
              This slug generates the URL `/members/[slug]` for this CV profile. Manual override is active if you type in it.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Professional & Academic Accreditation */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3">
          Lab Role & Academic Credentials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Position at Lab</label>
            <select
              name="positionAtLab"
              defaultValue={initialData?.positionAtLab || ""}
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            >
              <option value="">-- Select Position --</option>
              {positionAtLabOptions.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
              {initialData?.positionAtLab && !positionAtLabOptions.includes(initialData.positionAtLab) && (
                <option value={initialData.positionAtLab}>
                  {initialData.positionAtLab} (Legacy)
                </option>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">UNLP Academic position</label>
            <select
              name="positionAtUnlp"
              defaultValue={initialData?.positionAtUnlp || ""}
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            >
              <option value="">-- Select Position --</option>
              {positionAtUnlpOptions.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
              {initialData?.positionAtUnlp && !positionAtUnlpOptions.includes(initialData.positionAtUnlp) && (
                <option value={initialData.positionAtUnlp}>
                  {initialData.positionAtUnlp} (Legacy)
                </option>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Highest Degree</label>
            <input
              type="text"
              name="highestDegree"
              defaultValue={initialData?.highestDegree || ""}
              placeholder="e.g. Dr. en Ciencias Informáticas"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">CONICET Category</label>
            <select
              name="positionAtCONICET"
              defaultValue={initialData?.positionAtCONICET || ""}
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            >
              <option value="">-- Select Category --</option>
              {positionAtCONICETOptions.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
              {initialData?.positionAtCONICET && !positionAtCONICETOptions.includes(initialData.positionAtCONICET) && (
                <option value={initialData.positionAtCONICET}>
                  {initialData.positionAtCONICET} (Legacy)
                </option>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">CIC Position</label>
            <select
              name="positionAtCIC"
              defaultValue={initialData?.positionAtCIC || ""}
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            >
              <option value="">-- Select Position --</option>
              {positionAtCICOptions.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
              {initialData?.positionAtCIC && !positionAtCICOptions.includes(initialData.positionAtCIC) && (
                <option value={initialData.positionAtCIC}>
                  {initialData.positionAtCIC} (Legacy)
                </option>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">SICADI Category</label>
            <input
              type="text"
              name="sicadiCategory"
              defaultValue={initialData?.sicadiCategory || ""}
              placeholder="e.g. I, II, III"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Scientific Category (Incentivos)</label>
            <input
              type="text"
              name="category"
              defaultValue={initialData?.category || ""}
              placeholder="e.g. Cat I, Cat II"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Joined Lab (Date)</label>
            <input
              type="date"
              name="startDate"
              defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : ""}
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Left Lab (Date)</label>
            <input
              type="date"
              name="endDate"
              defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""}
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Courses taught at UNLP</label>
            <textarea
              name="coursesAtUNLP"
              defaultValue={initialData?.coursesAtUNLP || ""}
              placeholder="List courses separated by commas or lines..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-20 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Affiliations</label>
            <textarea
              name="affiliations"
              defaultValue={initialData?.affiliations || ""}
              placeholder="e.g. Lab - Department - University"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-20 resize-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Communication & Web Portals */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3">
          Contact Details & Web Profiles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Institutional Email</label>
            <input
              type="email"
              name="institutionalEmail"
              defaultValue={initialData?.institutionalEmail || ""}
              placeholder="e.g. name@domain.com"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Personal Email</label>
            <input
              type="email"
              name="personalEmail"
              defaultValue={initialData?.personalEmail || ""}
              placeholder="e.g. name@gmail.com"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Phone Number</label>
            <input
              type="text"
              name="phone"
              defaultValue={initialData?.phone || ""}
              placeholder="e.g. +54 221 ..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Personal Web Page URL</label>
            <input
              type="url"
              name="webPage"
              defaultValue={initialData?.webPage || ""}
              placeholder="e.g. https://..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">ORCID ID</label>
            <input
              type="text"
              name="orcid"
              defaultValue={initialData?.orcid || ""}
              placeholder="e.g. 0000-0002-1825-0097"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">DBLP Profile Link</label>
            <input
              type="url"
              name="dblpProfile"
              defaultValue={initialData?.dblpProfile || ""}
              placeholder="e.g. https://dblp.org/pid/..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Google Scholar URL</label>
            <input
              type="url"
              name="googleResearchProfile"
              defaultValue={initialData?.googleResearchProfile || ""}
              placeholder="e.g. https://scholar.google.com/citations?..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">ResearchGate URL</label>
            <input
              type="url"
              name="researchGateProfile"
              defaultValue={initialData?.researchGateProfile || ""}
              placeholder="e.g. https://www.researchgate.net/profile/..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Avatar Image URL</label>
            <input
              type="url"
              name="avatarUrl"
              defaultValue={initialData?.avatarUrl || ""}
              placeholder="e.g. https://..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5 md:col-span-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Interest Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              defaultValue={initialData?.tags ? initialData.tags.join(", ") : ""}
              placeholder="e.g. Semantic Web, Artificial Intelligence, HCI"
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Bilingual Biographies & General Notes */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-extrabold text-lg text-primary border-b border-border pb-3">
          Bilingual CV & Research Summaries
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🇬🇧 Short CV (English)</span>
            </label>
            <textarea
              name="shortCvInEnglish"
              defaultValue={initialData?.shortCvInEnglish || ""}
              placeholder="Write a concise professional biography in English..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🇪🇸 Breve CV (Español)</span>
            </label>
            <textarea
              name="shortCvInSpanish"
              defaultValue={initialData?.shortCvInSpanish || ""}
              placeholder="Escriba una biografía profesional breve en Español..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🇬🇧 Research Interests (English)</span>
            </label>
            <textarea
              name="interestsInEnglish"
              defaultValue={initialData?.interestsInEnglish || ""}
              placeholder="Summarize main research lines in English..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-28"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🇪🇸 Intereses de Investigación (Español)</span>
            </label>
            <textarea
              name="interestsInSpanish"
              defaultValue={initialData?.interestsInSpanish || ""}
              placeholder="Resuma las principales líneas de investigación en Español..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-28"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">General Notes</label>
            <textarea
              name="notes"
              defaultValue={initialData?.notes || ""}
              placeholder="Any additional system administrative notes..."
              className="w-full border border-border px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground text-sm h-20"
            />
          </div>
        </div>
      </div>

      {/* Form Submission Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href={initialData ? `/members/${initialData.slug}` : "/members"}
          className="px-6 py-3 rounded-xl border border-border text-slate-700 hover:bg-slate-100 transition-all font-bold text-sm cursor-pointer"
        >
          Cancel
        </Link>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isSubmitting ? "Saving Profile..." : initialData ? "Save Changes" : "Create Profile"}
        </button>
      </div>
    </form>
  );
}
