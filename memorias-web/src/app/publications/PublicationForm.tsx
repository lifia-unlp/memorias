"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveDoiAction, parseBibtex, createPublication, updatePublication } from "./actions";

export const BIBTEX_FIELDS_MAP: Record<string, { label: string; required: string[]; optional: string[] }> = {
  article: {
    label: "Article (Journal / Magazine)",
    required: ["journal", "volume"],
    optional: ["number", "pages", "month", "doi", "note", "key"],
  },
  book: {
    label: "Book / Monograph",
    required: ["publisher"],
    optional: ["editor", "volume", "number", "series", "address", "edition", "month", "note", "key", "url"],
  },
  inbook: {
    label: "Inbook (Part of a Book)",
    required: ["chapter", "pages", "publisher"],
    optional: ["editor", "volume", "number", "series", "type", "address", "edition", "month", "note", "key"],
  },
  incollection: {
    label: "Incollection (Book Chapter with Title)",
    required: ["booktitle", "publisher"],
    optional: ["editor", "volume", "number", "series", "type", "chapter", "pages", "address", "edition", "month", "note", "key"],
  },
  inproceedings: {
    label: "Inproceedings (Conference Article)",
    required: ["booktitle"],
    optional: ["editor", "volume", "number", "series", "pages", "address", "month", "organization", "publisher", "note", "key"],
  },
  manual: {
    label: "Manual (Technical Documentation)",
    required: [],
    optional: ["author", "organization", "address", "edition", "month", "year", "note", "key"],
  },
  mastersthesis: {
    label: "Master's Thesis",
    required: ["school"],
    optional: ["type", "address", "month", "note", "key"],
  },
  misc: {
    label: "Miscellaneous (Other)",
    required: [],
    optional: ["author", "howpublished", "month", "note", "key"],
  },
  phdthesis: {
    label: "PhD Thesis",
    required: ["school"],
    optional: ["type", "address", "month", "note", "key"],
  },
  proceedings: {
    label: "Proceedings (Conference)",
    required: [],
    optional: ["editor", "volume", "number", "series", "address", "month", "publisher", "organization", "note", "key"],
  },
  techreport: {
    label: "Technical Report",
    required: ["institution"],
    optional: ["type", "number", "address", "month", "note", "key"],
  },
  unpublished: {
    label: "Unpublished Manuscript",
    required: ["note"],
    optional: ["month", "key"],
  },
};

interface MemberOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ProjectOption {
  id: string;
  title: string;
  code: string | null;
}

interface ThesisOption {
  id: string;
  title: string;
  student: string | null;
}

interface PublicationFormProps {
  publication?: any; // If editing
  members: MemberOption[];
  projects: ProjectOption[];
  theses: ThesisOption[];
}

export function PublicationForm({
  publication,
  members,
  projects,
  theses,
}: PublicationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Ingestion path state: null = select wizard; 'doi' = doi mode; 'bibtex' = bibtex mode; 'form' = metadata form mode
  const [ingestionMethod, setIngestionMethod] = useState<"select" | "doi" | "bibtex" | "form">(
    publication ? "form" : "select"
  );

  // Ingestion inputs
  const [doiInput, setDoiInput] = useState("");
  const [bibInput, setBibInput] = useState("");
  const [ingestionError, setIngestionError] = useState("");

  // Granular form inputs
  const [title, setTitle] = useState(publication?.title || "");
  const [authors, setAuthors] = useState(publication?.authors || "");
  const [year, setYear] = useState<number>(publication?.year || new Date().getFullYear());
  const [type, setType] = useState(publication?.type || "article");
  const [ranking, setRanking] = useState(publication?.ranking || "");
  const [selfArchivingUrl, setSelfArchivingUrl] = useState(publication?.selfArchivingUrl || "");
  const [tagsInput, setTagsInput] = useState((publication?.tags || []).join(", "));
  const [citationKey, setCitationKey] = useState(
    publication?.bibtexData?.citationKey || ""
  );
  const [customEntryTags, setCustomEntryTags] = useState<Record<string, string>>(
    publication?.bibtexData?.entryTags || {}
  );
  const [featured, setFeatured] = useState<boolean>(publication?.featured || false);

  // Relation selections
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    publication?.members?.map((m: any) => m.id) || []
  );
  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    publication?.projects?.map((p: any) => p.id) || []
  );
  const [selectedTheses, setSelectedTheses] = useState<string[]>(
    publication?.theses?.map((t: any) => t.id) || []
  );

  // Search filters for lists
  const [memberFilter, setMemberFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [thesisFilter, setThesisFilter] = useState("");

  const [formError, setFormError] = useState("");

  // ---------------------------------------------------------
  // Ingestion Triggers
  // ---------------------------------------------------------

  // 1. Resolve DOI
  const handleDoiImport = () => {
    setIngestionError("");
    if (!doiInput.trim()) {
      setIngestionError("Please enter a valid DOI");
      return;
    }

    startTransition(async () => {
      const res = await resolveDoiAction(doiInput);
      if (res.success && res.data) {
        setTitle(res.data.title);
        setAuthors(res.data.authors);
        setYear(res.data.year);
        setType(res.data.type);
        setCitationKey(res.data.citationKey);
        setSelfArchivingUrl(res.data.selfArchivingUrl);
        setRanking(res.data.ranking);
        setCustomEntryTags(res.data.entryTags);
        setIngestionMethod("form");
      } else {
        setIngestionError(res.error || "Failed to resolve DOI. Please verify and try again.");
      }
    });
  };

  // 2. Parse raw BibTeX
  const handleBibtexParse = () => {
    setIngestionError("");
    if (!bibInput.trim()) {
      setIngestionError("Please paste a valid BibTeX entry");
      return;
    }

    startTransition(async () => {
      const res = await parseBibtex(bibInput);
      if (res.success && res.data) {
        setTitle(res.data.title);
        setAuthors(res.data.authors);
        setYear(res.data.year);
        setType(res.data.type);
        setCitationKey(res.data.citationKey);
        setSelfArchivingUrl(res.data.selfArchivingUrl);
        setRanking(res.data.ranking);
        setCustomEntryTags(res.data.entryTags);
        setIngestionMethod("form");
      } else {
        setIngestionError(res.error || "Failed to parse BibTeX string.");
      }
    });
  };

  // ---------------------------------------------------------
  // Form Submit
  // ---------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !authors.trim() || !year || !type) {
      setFormError("Title, Authors, Year, and Publication Type are mandatory fields.");
      return;
    }

    // Dynamic type-specific required fields validation
    const config = BIBTEX_FIELDS_MAP[type];
    if (config) {
      for (const reqField of config.required) {
        if (!customEntryTags[reqField]?.trim()) {
          setFormError(`"${reqField}" is a required field for publication type "${BIBTEX_FIELDS_MAP[type].label}".`);
          return;
        }
      }
    }

    const tags = tagsInput
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    // Filter customEntryTags to only save fields belonging to the active type
    const filteredCustomTags: Record<string, string> = {};
    if (config) {
      const allowedFields = [...config.required, ...config.optional];
      for (const [key, value] of Object.entries(customEntryTags)) {
        if (allowedFields.includes(key) && value.trim()) {
          filteredCustomTags[key] = value.trim();
        }
      }
    }

    const payload = {
      title,
      authors,
      year: Number(year),
      type,
      ranking: ranking || undefined,
      selfArchivingUrl: selfArchivingUrl || undefined,
      tags,
      members: selectedMembers,
      projects: selectedProjects,
      theses: selectedTheses,
      citationKey: citationKey || undefined,
      customEntryTags: Object.keys(filteredCustomTags).length > 0 ? filteredCustomTags : undefined,
      featured,
    };

    startTransition(async () => {
      let res;
      if (publication) {
        res = await updatePublication(publication.slug, payload);
      } else {
        res = await createPublication(payload);
      }

      if (res.success) {
        router.push(`/publications/${res.slug}`);
      } else {
        setFormError(res.error || "An unexpected error occurred while saving the publication");
      }
    });
  };

  // Filter lists
  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberFilter.toLowerCase())
  );
  const filteredProjects = projects.filter((p) =>
    `${p.title} ${p.code || ""}`.toLowerCase().includes(projectFilter.toLowerCase())
  );
  const filteredTheses = theses.filter((t) =>
    `${t.title} ${t.student || ""}`.toLowerCase().includes(thesisFilter.toLowerCase())
  );

  // ---------------------------------------------------------
  // Step 1: Select Wizard UI
  // ---------------------------------------------------------
  if (ingestionMethod === "select") {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            How would you like to add the publication?
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Choose an ingestion path to instantly resolve, populate, and pre-fill publication metadata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: DOI */}
          <button
            onClick={() => setIngestionMethod("doi")}
            className="flex flex-col items-center justify-between text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary hover:shadow-xl transition-all duration-350 cursor-pointer group"
          >
            <div className="space-y-4">
              <span className="text-4xl block group-hover:scale-110 transition-transform">🔗</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Import with DOI</h3>
              <p className="text-xs text-slate-500">
                Paste a Digital Object Identifier (DOI) and query research metadata directly from CrossRef.
              </p>
            </div>
            <span className="mt-6 text-xs font-bold text-primary dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Select DOI Import ➔
            </span>
          </button>

          {/* Card 2: BibTeX */}
          <button
            onClick={() => setIngestionMethod("bibtex")}
            className="flex flex-col items-center justify-between text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary hover:shadow-xl transition-all duration-350 cursor-pointer group"
          >
            <div className="space-y-4">
              <span className="text-4xl block group-hover:scale-110 transition-transform">📄</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Parse from BibTeX</h3>
              <p className="text-xs text-slate-500">
                Paste a raw BibTeX citation entry. We will automatically parse, clean, and populate the attributes.
              </p>
            </div>
            <span className="mt-6 text-xs font-bold text-primary dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Select BibTeX Ingest ➔
            </span>
          </button>

          {/* Card 3: Manual */}
          <button
            onClick={() => setIngestionMethod("form")}
            className="flex flex-col items-center justify-between text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary hover:shadow-xl transition-all duration-350 cursor-pointer group"
          >
            <div className="space-y-4">
              <span className="text-4xl block group-hover:scale-110 transition-transform">✍️</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Manually</h3>
              <p className="text-xs text-slate-500">
                Skip the auto-ingestion path and jump straight to building an empty manual bibliography.
              </p>
            </div>
            <span className="mt-6 text-xs font-bold text-primary dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Start Manually ➔
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // DOI Wizard View
  // ---------------------------------------------------------
  if (ingestionMethod === "doi") {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-border p-8 rounded-3xl shadow-lg space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <button
            onClick={() => setIngestionMethod("select")}
            className="text-xs text-primary dark:text-blue-400 font-bold hover:underline mb-2 cursor-pointer block"
          >
            ← Back to options
          </button>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Import via DOI
          </h3>
          <p className="text-xs text-slate-500">
            Provide a DOI identifier (e.g. <code>10.1007/978-3-030-30796-7_4</code>).
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              DOI Reference
            </label>
            <input
              type="text"
              placeholder="e.g. 10.1007/..."
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm font-mono"
            />
          </div>

          {ingestionError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
              ⚠️ {ingestionError}
            </div>
          )}

          <button
            onClick={handleDoiImport}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {isPending ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Resolving DOI...
              </>
            ) : (
              "⚡ Resolve & Pre-fill Form"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // BibTeX Wizard View
  // ---------------------------------------------------------
  if (ingestionMethod === "bibtex") {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-border p-8 rounded-3xl shadow-lg space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <button
            onClick={() => setIngestionMethod("select")}
            className="text-xs text-primary dark:text-blue-400 font-bold hover:underline mb-2 cursor-pointer block"
          >
            ← Back to options
          </button>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Parse from BibTeX
          </h3>
          <p className="text-xs text-slate-500">
            Paste the raw BibTeX entry source.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              BibTeX Source Code
            </label>
            <textarea
              rows={8}
              placeholder="@article{silva2025, ...}"
              value={bibInput}
              onChange={(e) => setBibInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-xs font-mono"
            />
          </div>

          {ingestionError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
              ⚠️ {ingestionError}
            </div>
          )}

          <button
            onClick={handleBibtexParse}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {isPending ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Parsing BibTeX...
              </>
            ) : (
              "⚡ Parse & Pre-fill Form"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Final Ingestion / Meta-Data Edit Form View
  // ---------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-10 animate-fadeIn">
      {/* Visual Ingested Banner Alert */}
      {!publication && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <span className="block text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Metadata populated successfully!
              </span>
              <span className="block text-[11px] text-emerald-600 dark:text-emerald-500">
                You can now edit, complete relation tags, or save this publication record below.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIngestionMethod("select")}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline cursor-pointer"
          >
            Start over
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Details (2 columns wide) */}
        <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 border border-border p-8 rounded-3xl shadow-sm">
          <h3 className="text-xl font-extrabold border-b border-border pb-3 mb-4 text-slate-800 dark:text-slate-100">
            Publication Parameters
          </h3>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Publication Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A Semantic Web Architecture for Open Research Repositories"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Authors <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="e.g. Silva, Alejandro and Mendoza, Carlos"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm font-mono"
              />
              <span className="block text-[10px] text-slate-400 mt-1">
                Separate author names using the keyword <code>and</code> (BibTeX standard format).
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Publication Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={year || ""}
                  onChange={(e) => setYear(Number(e.target.value))}
                  placeholder="e.g. 2025"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm"
                >
                  {Object.entries(BIBTEX_FIELDS_MAP).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Ranking (Optional)
                </label>
                <input
                  type="text"
                  value={ranking}
                  onChange={(e) => setRanking(e.target.value)}
                  placeholder="e.g. CORE A, Q1, Scopus"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Self-Archiving PDF URL (Optional)
                </label>
                <input
                  type="url"
                  value={selfArchivingUrl}
                  onChange={(e) => setSelfArchivingUrl(e.target.value)}
                  placeholder="e.g. https://docs.domain.com/...pdf"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Custom Tags / Keywords (Optional)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Semantic Web, Ontology, Research portal"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm"
              />
              <span className="block text-[10px] text-slate-400 mt-1">
                Enter comma-separated values.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Citation Key Reference (Optional)
              </label>
              <input
                type="text"
                value={citationKey}
                onChange={(e) => setCitationKey(e.target.value)}
                placeholder="e.g. silva2025semantic"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm font-mono"
              />
            </div>

            {/* Featured Paper Switcher */}
            <div className="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 border border-primary/10 p-4 rounded-xl">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              <div>
                <label htmlFor="featured" className="block text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Featured Publication
                </label>
                <span className="block text-[10px] text-muted leading-tight mt-0.5">
                  Highlight this paper on the home page as part of the selected scientific bibliography feed.
                </span>
              </div>
            </div>

            {/* Dynamic Type-Specific Fields */}
            <div className="border-t border-slate-100 dark:border-slate-800/50 pt-6 mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                  Type-Specific Metadata ({BIBTEX_FIELDS_MAP[type]?.label || type})
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Provide additional metadata specific to the selected publication type. Required fields are marked with a red asterisk (<span className="text-red-500">*</span>).
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Render Required Fields */}
                {BIBTEX_FIELDS_MAP[type]?.required.map((field) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      {field} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customEntryTags[field] || ""}
                      onChange={(e) => {
                        setCustomEntryTags({
                          ...customEntryTags,
                          [field]: e.target.value,
                        });
                      }}
                      placeholder={`e.g. enter ${field}`}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm"
                    />
                  </div>
                ))}

                {/* Render Optional Fields */}
                {BIBTEX_FIELDS_MAP[type]?.optional.map((field) => {
                  // Skip standard core fields already in the top section
                  if (["author", "title", "year", "doi"].includes(field)) return null;

                  return (
                    <div key={field}>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        {field} (Optional)
                      </label>
                      <input
                        type="text"
                        value={customEntryTags[field] || ""}
                        onChange={(e) => {
                          setCustomEntryTags({
                            ...customEntryTags,
                            [field]: e.target.value,
                          });
                        }}
                        placeholder={`e.g. enter ${field}`}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white transition-all text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {formError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
              ⚠️ {formError}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-border mt-6">
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider"
            >
              {isPending ? "Saving..." : "Save Publication"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-6 py-3 rounded-xl transition-all border border-border cursor-pointer text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Column: Relational Checklists (1 column wide) */}
        <div className="space-y-6">
          
          {/* Members checklist */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold border-b border-border pb-2 text-slate-800 dark:text-slate-100">
              Associated Members
            </h4>
            <input
              type="text"
              placeholder="Search researchers..."
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/20 dark:bg-slate-950 dark:text-white text-xs"
            />
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border/50 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/20">
              {filteredMembers.map((m) => {
                const checked = selectedMembers.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 p-1.5 rounded-lg cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setSelectedMembers(selectedMembers.filter((id) => id !== m.id));
                        } else {
                          setSelectedMembers([...selectedMembers, m.id]);
                        }
                      }}
                      className="mt-0.5"
                    />
                    <span>
                      {m.firstName} {m.lastName}
                    </span>
                  </label>
                );
              })}
              {filteredMembers.length === 0 && (
                <span className="text-[10px] text-slate-400 block text-center py-4">
                  No members found
                </span>
              )}
            </div>
          </div>

          {/* Projects checklist */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold border-b border-border pb-2 text-slate-800 dark:text-slate-100">
              Connected Projects
            </h4>
            <input
              type="text"
              placeholder="Search projects..."
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/20 dark:bg-slate-950 dark:text-white text-xs"
            />
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border/50 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/20">
              {filteredProjects.map((p) => {
                const checked = selectedProjects.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 p-1.5 rounded-lg cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setSelectedProjects(selectedProjects.filter((id) => id !== p.id));
                        } else {
                          setSelectedProjects([...selectedProjects, p.id]);
                        }
                      }}
                      className="mt-0.5"
                    />
                    <span>
                      {p.code ? `[${p.code}] ` : ""}
                      {p.title}
                    </span>
                  </label>
                );
              })}
              {filteredProjects.length === 0 && (
                <span className="text-[10px] text-slate-400 block text-center py-4">
                  No projects found
                </span>
              )}
            </div>
          </div>

          {/* Theses checklist */}
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold border-b border-border pb-2 text-slate-800 dark:text-slate-100">
              Related Theses
            </h4>
            <input
              type="text"
              placeholder="Search theses..."
              value={thesisFilter}
              onChange={(e) => setThesisFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/20 dark:bg-slate-950 dark:text-white text-xs"
            />
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border/50 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/20">
              {filteredTheses.map((t) => {
                const checked = selectedTheses.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 p-1.5 rounded-lg cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setSelectedTheses(selectedTheses.filter((id) => id !== t.id));
                        } else {
                          setSelectedTheses([...selectedTheses, t.id]);
                        }
                      }}
                      className="mt-0.5"
                    />
                    <span>
                      {t.title}
                      {t.student ? ` (${t.student})` : ""}
                    </span>
                  </label>
                );
              })}
              {filteredTheses.length === 0 && (
                <span className="text-[10px] text-slate-400 block text-center py-4">
                  No theses found
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
