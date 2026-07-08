import { useState, useTransition } from "react";
import { resolveDoiAction, parseBibtex, createPublication, updatePublication } from "./actions";
import { BIBTEX_FIELDS_MAP } from "./PublicationForm";

interface UsePublicationFormProps {
  publication?: any;
  router: any;
}

export function usePublicationForm({ publication, router }: UsePublicationFormProps) {
  const [isPending, startTransition] = useTransition();

  // Ingestion path state
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
  const [tags, setTags] = useState<string[]>(publication?.tags || []);
  const [citationKey, setCitationKey] = useState(
    publication?.bibtexData?.citationKey || ""
  );
  const [doi, setDoi] = useState(
    publication?.bibtexData?.entryTags?.doi ||
    publication?.bibtexData?.entryTags?.DOI ||
    ""
  );
  const [abstract, setAbstract] = useState(
    publication?.bibtexData?.entryTags?.abstract ||
    publication?.bibtexData?.entryTags?.ABSTRACT ||
    ""
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

  const [formError, setFormError] = useState("");

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
        setRanking(res.data.ranking);
        setDoi(res.data.entryTags?.doi || res.data.entryTags?.DOI || doiInput);
        setAbstract(res.data.entryTags?.abstract || res.data.entryTags?.ABSTRACT || "");
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
        setRanking(res.data.ranking);
        setDoi(res.data.entryTags?.doi || res.data.entryTags?.DOI || "");
        setAbstract(res.data.entryTags?.abstract || res.data.entryTags?.ABSTRACT || "");
        setCustomEntryTags(res.data.entryTags);
        setIngestionMethod("form");
      } else {
        setIngestionError(res.error || "Failed to parse BibTeX string.");
      }
    });
  };

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
      doi: doi || undefined,
      abstract: abstract || undefined,
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
      } else if ((res as any).duplicate) {
        const choice = confirm(
          `${res.error}\n\nDo you want to save this publication entry anyway?`
        );
        if (choice) {
          startTransition(async () => {
            const bypassRes = publication
              ? await updatePublication(publication.slug, { ...payload, ignoreDuplicateCheck: true })
              : await createPublication({ ...payload, ignoreDuplicateCheck: true });
            
            if (bypassRes.success) {
              router.push(`/publications/${bypassRes.slug}`);
            } else {
              setFormError(bypassRes.error || "An unexpected error occurred while saving.");
            }
          });
        }
      } else {
        setFormError(res.error || "An unexpected error occurred while saving the publication");
      }
    });
  };

  return {
    ingestionMethod,
    setIngestionMethod,
    doiInput,
    setDoiInput,
    bibInput,
    setBibInput,
    ingestionError,
    title,
    setTitle,
    authors,
    setAuthors,
    year,
    setYear,
    type,
    setType,
    ranking,
    setRanking,
    selfArchivingUrl,
    setSelfArchivingUrl,
    tags,
    setTags,
    citationKey,
    setCitationKey,
    doi,
    setDoi,
    abstract,
    setAbstract,
    customEntryTags,
    setCustomEntryTags,
    featured,
    setFeatured,
    selectedMembers,
    setSelectedMembers,
    selectedProjects,
    setSelectedProjects,
    selectedTheses,
    setSelectedTheses,
    formError,
    setFormError,
    isPending,
    handleDoiImport,
    handleBibtexParse,
    handleSubmit,
  };
}
