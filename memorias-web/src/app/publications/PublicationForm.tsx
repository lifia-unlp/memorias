"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TagWidget } from "@/components/TagWidget";
import { MemberSelector } from "@/components/reusable/MemberSelector";
import { ProjectSelector } from "@/components/reusable/ProjectSelector";
import { ThesisSelector } from "@/components/reusable/ThesisSelector";
import { usePublicationForm } from "./usePublicationForm";
import { PublicationWizard } from "./PublicationWizard";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";

import { BIBTEX_FIELDS_MAP } from "./publicationFields";


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

  // Form State custom hook
  const {
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
    isPending,
    handleDoiImport,
    handleBibtexParse,
    handleSubmit,
  } = usePublicationForm({ publication, router });

  // Render Wizard paths (select, doi input or bibtex code input)
  if (ingestionMethod !== "form") {
    return (
      <PublicationWizard
        ingestionMethod={ingestionMethod}
        setIngestionMethod={setIngestionMethod}
        doiInput={doiInput}
        setDoiInput={setDoiInput}
        bibInput={bibInput}
        setBibInput={setBibInput}
        ingestionError={ingestionError}
        isPending={isPending}
        handleDoiImport={handleDoiImport}
        handleBibtexParse={handleBibtexParse}
      />
    );
  }

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
          <MemberSelector
            items={members}
            selectedIds={selectedMembers}
            onChange={setSelectedMembers}
            layout="list"
          />

          {/* Projects checklist */}
          <ProjectSelector
            items={projects}
            selectedIds={selectedProjects}
            onChange={setSelectedProjects}
            layout="list"
          />

          {/* Theses checklist */}
          <ThesisSelector
            items={theses}
            selectedIds={selectedTheses}
            onChange={setSelectedTheses}
            layout="list"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
