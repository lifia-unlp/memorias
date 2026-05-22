"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveDoiAction, parseBibtex, createPublication, updatePublication } from "./actions";
import { TagWidget } from "@/components/TagWidget";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Chip,
  FormControlLabel,
  Checkbox,
  MenuItem,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

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
  publication?: any;
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

  // Search filters for lists
  const [memberFilter, setMemberFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [thesisFilter, setThesisFilter] = useState("");

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

  // 1. Select Wizard UI
  if (ingestionMethod === "select") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, py: 4 }}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
            How would you like to add the publication?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
            Choose an ingestion path to instantly resolve, populate, and pre-fill publication metadata.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: "center" }}>
          {/* Card 1: DOI */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              onClick={() => setIngestionMethod("doi")}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "between",
                textAlign: "center",
                p: 3,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
                  Import with DOI
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  Paste a Digital Object Identifier (DOI) and query research metadata directly from CrossRef.
                </Typography>
                <Button variant="text" size="small" color="primary" sx={{ mt: 3, fontWeight: "bold" }}>
                  Select DOI Import
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: BibTeX */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              onClick={() => setIngestionMethod("bibtex")}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "between",
                textAlign: "center",
                p: 3,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
                  Parse from BibTeX
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  Paste a raw BibTeX citation entry. We will automatically parse, clean, and populate the attributes.
                </Typography>
                <Button variant="text" size="small" color="primary" sx={{ mt: 3, fontWeight: "bold" }}>
                  Select BibTeX Ingest
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Manual */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              onClick={() => setIngestionMethod("form")}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "between",
                textAlign: "center",
                p: 3,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
                  Add Manually
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  Skip the auto-ingestion path and jump straight to building an empty manual bibliography.
                </Typography>
                <Button variant="text" size="small" color="primary" sx={{ mt: 3, fontWeight: "bold" }}>
                  Start Manually
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 2. DOI Wizard View
  if (ingestionMethod === "doi") {
    return (
      <Card variant="outlined" sx={{ maxWidth: 500, mx: "auto", borderRadius: 4, p: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Button
              onClick={() => setIngestionMethod("select")}
              variant="text"
              size="small"
              sx={{ fontWeight: "bold", mb: 1, p: 0 }}
            >
              Back to options
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Import via DOI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Provide a DOI identifier (e.g. 10.1007/978-3-030-30796-7_4).
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="DOI Reference"
              placeholder="e.g. 10.1007/..."
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              size="small"
              slotProps={{
                htmlInput: { style: { fontFamily: "monospace" } }
              }}
            />

            {ingestionError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {ingestionError}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleDoiImport}
              disabled={isPending}
              fullWidth
              sx={{ py: 1.2, fontWeight: "bold", borderRadius: 2 }}
            >
              {isPending ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="button">Resolving DOI...</Typography>
                </Box>
              ) : (
                "Resolve and Pre-fill Form"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 3. BibTeX Wizard View
  if (ingestionMethod === "bibtex") {
    return (
      <Card variant="outlined" sx={{ maxWidth: 600, mx: "auto", borderRadius: 4, p: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Button
              onClick={() => setIngestionMethod("select")}
              variant="text"
              size="small"
              sx={{ fontWeight: "bold", mb: 1, p: 0 }}
            >
              Back to options
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Parse from BibTeX
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Paste the raw BibTeX entry source.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="BibTeX Source Code"
              placeholder="@article{silva2025, ...}"
              value={bibInput}
              onChange={(e) => setBibInput(e.target.value)}
              slotProps={{
                htmlInput: { style: { fontFamily: "monospace", fontSize: "0.75rem" } }
              }}
            />

            {ingestionError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {ingestionError}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleBibtexParse}
              disabled={isPending}
              fullWidth
              sx={{ py: 1.2, fontWeight: "bold", borderRadius: 2 }}
            >
              {isPending ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="button">Parsing BibTeX...</Typography>
                </Box>
              ) : (
                "Parse and Pre-fill Form"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 4. Main Metadata Form View
  const config = BIBTEX_FIELDS_MAP[type];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pb: 8 }}>
      {/* Visual Ingested Banner Alert */}
      {!publication && (
        <Alert
          severity="success"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setIngestionMethod("select")}
              sx={{ fontWeight: "bold" }}
            >
              Start over
            </Button>
          }
          sx={{ borderRadius: 3, mb: 4 }}
        >
          Metadata populated successfully! You can now edit, complete relation tags, or save this publication record below.
        </Alert>
      )}
      <Grid container spacing={4}>
        {/* Left Column: Core Fields */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 1 }}>
                Publication Parameters
              </Typography>

              <TextField
                fullWidth
                label="Publication Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A Semantic Web Architecture for Open Research Repositories"
                size="small"
              />

              <TextField
                fullWidth
                label="Authors"
                required
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="e.g. Silva, Alejandro and Mendoza, Carlos"
                size="small"
                helperText="Separate author names using the keyword 'and' (BibTeX standard format)."
                slotProps={{
                  htmlInput: { style: { fontFamily: "monospace" } }
                }}
              />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Publication Year"
                    required
                    value={year || ""}
                    onChange={(e) => setYear(Number(e.target.value))}
                    placeholder="e.g. 2025"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    size="small"
                  >
                    {Object.entries(BIBTEX_FIELDS_MAP).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Ranking (Optional)"
                    value={ranking}
                    onChange={(e) => setRanking(e.target.value)}
                    placeholder="e.g. CORE A, Q1, Scopus"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="url"
                    label="Self-Archiving PDF URL (Optional)"
                    value={selfArchivingUrl}
                    onChange={(e) => setSelfArchivingUrl(e.target.value)}
                    placeholder="e.g. https://docs.domain.com/...pdf"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="DOI (Optional)"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="e.g. 10.1007/..."
                    size="small"
                    slotProps={{
                      htmlInput: { style: { fontFamily: "monospace" } }
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ border: "1px solid", borderColor: "divider", p: 2.5, borderRadius: 3, bgcolor: "action.hover", my: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Research Classification Tags
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  Add custom keywords and research classifications to tag this publication globally.
                </Typography>
                <TagWidget
                  initialTags={tags}
                  placeholder="Add custom tags or keywords..."
                  onChange={(newTags) => setTags(newTags)}
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Abstract (Optional)"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Provide a detailed abstract summary of the publication scope, methodology, and key contributions..."
              />

              <TextField
                fullWidth
                label="Citation Key Reference (Optional)"
                value={citationKey}
                onChange={(e) => setCitationKey(e.target.value)}
                placeholder="e.g. silva2025semantic"
                size="small"
                slotProps={{
                  htmlInput: { style: { fontFamily: "monospace" } }
                }}
              />

              <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", border: "1px dashed", borderColor: "divider" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        Featured Publication
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        Highlight this paper on the home page as part of the selected scientific bibliography feed.
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {/* Dynamic Type-Specific Fields */}
              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3, mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Type-Specific Metadata: {config?.label || type}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
                  Provide additional metadata specific to the selected publication type. Required fields are marked with an asterisk (*).
                </Typography>

                <Grid container spacing={3}>
                  {/* Render Required Fields */}
                  {config?.required.map((field) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field}>
                      <TextField
                        fullWidth
                        required
                        label={`${field} *`}
                        value={customEntryTags[field] || ""}
                        onChange={(e) => {
                          setCustomEntryTags({
                            ...customEntryTags,
                            [field]: e.target.value,
                          });
                        }}
                        placeholder={`e.g. enter ${field}`}
                        size="small"
                      />
                    </Grid>
                  ))}

                  {/* Render Optional Fields */}
                  {config?.optional.map((field) => {
                    if (["author", "title", "year", "doi", "key"].includes(field)) return null;

                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={field}>
                        <TextField
                          fullWidth
                          label={`${field} (Optional)`}
                          value={customEntryTags[field] || ""}
                          onChange={(e) => {
                            setCustomEntryTags({
                              ...customEntryTags,
                              [field]: e.target.value,
                            });
                          }}
                          placeholder={`e.g. enter ${field}`}
                          size="small"
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {formError && (
                <Alert severity="error" sx={{ borderRadius: 2, mt: 2 }}>
                  {formError}
                </Alert>
              )}

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isPending}
                  sx={{ px: 4, py: 1.2, fontWeight: "bold", borderRadius: 2 }}
                >
                  {isPending ? "Saving..." : "Save Publication"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  sx={{ px: 4, py: 1.2, fontWeight: "bold", borderRadius: 2 }}
                >
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Connection lists */}
        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Members checklist */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
                Associated Members
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search researchers..."
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              />
              <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1, bgcolor: "background.paper" }}>
                <List dense disablePadding>
                  {filteredMembers.map((m) => {
                    const checked = selectedMembers.includes(m.id);
                    return (
                      <ListItemButton
                        key={m.id}
                        dense
                        onClick={() => {
                          if (checked) {
                            setSelectedMembers(selectedMembers.filter((id) => id !== m.id));
                          } else {
                            setSelectedMembers([...selectedMembers, m.id]);
                          }
                        }}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <Checkbox
                          edge="start"
                          checked={checked}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                        <ListItemText
                          primary={`${m.firstName} ${m.lastName}`}
                          slotProps={{
                            primary: { sx: { fontSize: "0.75rem", fontWeight: checked ? "bold" : "normal" } }
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", py: 2 }}>
                      No members found
                    </Typography>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>

          {/* Projects checklist */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
                Connected Projects
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search projects..."
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              />
              <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1, bgcolor: "background.paper" }}>
                <List dense disablePadding>
                  {filteredProjects.map((p) => {
                    const checked = selectedProjects.includes(p.id);
                    return (
                      <ListItemButton
                        key={p.id}
                        dense
                        onClick={() => {
                          if (checked) {
                            setSelectedProjects(selectedProjects.filter((id) => id !== p.id));
                          } else {
                            setSelectedProjects([...selectedProjects, p.id]);
                          }
                        }}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <Checkbox
                          edge="start"
                          checked={checked}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                        <ListItemText
                          primary={(p.code ? `[${p.code}] ` : "") + p.title}
                          slotProps={{
                            primary: { sx: { fontSize: "0.75rem", fontWeight: checked ? "bold" : "normal" } }
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", py: 2 }}>
                      No projects found
                    </Typography>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>

          {/* Theses checklist */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
                Related Theses
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search theses..."
                value={thesisFilter}
                onChange={(e) => setThesisFilter(e.target.value)}
              />
              <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1, bgcolor: "background.paper" }}>
                <List dense disablePadding>
                  {filteredTheses.map((t) => {
                    const checked = selectedTheses.includes(t.id);
                    return (
                      <ListItemButton
                        key={t.id}
                        dense
                        onClick={() => {
                          if (checked) {
                            setSelectedTheses(selectedTheses.filter((id) => id !== t.id));
                          } else {
                            setSelectedTheses([...selectedTheses, t.id]);
                          }
                        }}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <Checkbox
                          edge="start"
                          checked={checked}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                        <ListItemText
                          primary={t.title + (t.student ? ` (${t.student})` : "")}
                          slotProps={{
                            primary: { sx: { fontSize: "0.75rem", fontWeight: checked ? "bold" : "normal" } }
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                  {filteredTheses.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", py: 2 }}>
                      No theses found
                    </Typography>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
