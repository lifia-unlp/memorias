"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createMember, updateMember } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TagWidget } from "@/components/TagWidget";
import { AcmCcsSelector } from "@/components/AcmCcsSelector";
import { getAcmCcsPath } from "@/lib/acm-ccs-utils";
import flatLookup from "@/lib/acm_ccs_flat.json";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  Chip,
  InputAdornment,
  Dialog,
  DialogContent,
} from "@mui/material";

interface MemberFormProps {
  initialData?: any;
  systemOptions?: any[];
}

export function MemberForm({ initialData, systemOptions = [] }: MemberFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startDateType, setStartDateType] = useState(initialData?.startDate ? "date" : "text");
  const [endDateType, setEndDateType] = useState(initialData?.endDate ? "date" : "text");

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

  // ACM CCS Interests States
  const [isAcmSelectorOpen, setIsAcmSelectorOpen] = useState(false);
  const initialAcmIds = useMemo<string[]>(() => {
    const value = initialData?.interestsInEnglish;
    if (!value) return [];
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string");
        }
      } catch (e) {
        // Fallback
      }
    }
    return [];
  }, [initialData]);
  const [acmInterests, setAcmInterests] = useState<string[]>(initialAcmIds);

  const isLegacyText = useMemo(() => {
    const val = initialData?.interestsInEnglish;
    if (!val) return false;
    const trimmed = val.trim();
    return !trimmed.startsWith("[") || !trimmed.endsWith("]");
  }, [initialData]);

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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 8 }}>
      {errorMsg && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {errorMsg}
        </Alert>
      )}
      {/* 1. Core Profile Details Card */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Core Profile Info
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alejandro"
                size="small"
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Fernandez"
                size="small"
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="SEO Slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setIsSlugOverridden(true);
                  setSlug(e.target.value);
                }}
                placeholder="e.g. alejandro-fernandez"
                size="small"
                variant="outlined"
                helperText="This slug generates the URL /members/[slug] for this CV profile. Manual override is active if you type in it."
                slotProps={{ input: {
                  endAdornment: (
                    <InputAdornment position="end" sx={{ gap: 1 }}>
                      {!isSlugOverridden ? (
                        <Chip
                          label="Auto-Generated"
                          color="success"
                          size="small"
                          sx={{ fontWeight: "bold", borderRadius: 1 }}
                        />
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setIsSlugOverridden(false);
                            const generated = `${firstName} ${lastName}`
                              .toLowerCase()
                              .trim()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "");
                            setSlug(generated);
                          }}
                          sx={{ textTransform: "none", py: 0.25, px: 1, fontSize: "0.625rem", fontWeight: "bold" }}
                        >
                          Reset Auto
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 2. Professional & Academic Accreditation */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Lab Role & Academic Credentials
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Position at Lab"
                name="positionAtLab"
                defaultValue={initialData?.positionAtLab || ""}
                size="small"
              >
                <MenuItem value="">-- Select Position --</MenuItem>
                {positionAtLabOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ))}
                {initialData?.positionAtLab && !positionAtLabOptions.includes(initialData.positionAtLab) && (
                  <MenuItem value={initialData.positionAtLab}>
                    {initialData.positionAtLab} (Legacy)
                  </MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="UNLP Academic Position"
                name="positionAtUnlp"
                defaultValue={initialData?.positionAtUnlp || ""}
                size="small"
              >
                <MenuItem value="">-- Select Position --</MenuItem>
                {positionAtUnlpOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ))}
                {initialData?.positionAtUnlp && !positionAtUnlpOptions.includes(initialData.positionAtUnlp) && (
                  <MenuItem value={initialData.positionAtUnlp}>
                    {initialData.positionAtUnlp} (Legacy)
                  </MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Highest Degree"
                name="highestDegree"
                defaultValue={initialData?.highestDegree || ""}
                placeholder="e.g. Dr. en Ciencias Informaticas"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="CONICET Category"
                name="positionAtCONICET"
                defaultValue={initialData?.positionAtCONICET || ""}
                size="small"
              >
                <MenuItem value="">-- Select Category --</MenuItem>
                {positionAtCONICETOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ))}
                {initialData?.positionAtCONICET && !positionAtCONICETOptions.includes(initialData.positionAtCONICET) && (
                  <MenuItem value={initialData.positionAtCONICET}>
                    {initialData.positionAtCONICET} (Legacy)
                  </MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="CIC Position"
                name="positionAtCIC"
                defaultValue={initialData?.positionAtCIC || ""}
                size="small"
              >
                <MenuItem value="">-- Select Position --</MenuItem>
                {positionAtCICOptions.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ))}
                {initialData?.positionAtCIC && !positionAtCICOptions.includes(initialData.positionAtCIC) && (
                  <MenuItem value={initialData.positionAtCIC}>
                    {initialData.positionAtCIC} (Legacy)
                  </MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="SICADI Category"
                name="sicadiCategory"
                defaultValue={initialData?.sicadiCategory || ""}
                placeholder="e.g. I, II, III"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Scientific Category (Incentivos)"
                name="category"
                defaultValue={initialData?.category || ""}
                placeholder="e.g. Cat I, Cat II"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type={startDateType}
                label="Joined Lab"
                name="startDate"
                defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : ""}
                placeholder="dd/mm/yyyy"
                onFocus={() => setStartDateType("date")}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setStartDateType("text");
                  }
                }}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type={endDateType}
                label="Left Lab"
                name="endDate"
                defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""}
                placeholder="dd/mm/yyyy"
                onFocus={() => setEndDateType("date")}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setEndDateType("text");
                  }
                }}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Courses taught at UNLP"
                name="coursesAtUNLP"
                defaultValue={initialData?.coursesAtUNLP || ""}
                placeholder="List courses separated by commas or lines..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Affiliations"
                name="affiliations"
                defaultValue={initialData?.affiliations || ""}
                placeholder="e.g. Lab - Department - University"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 3. Communication & Web Portals */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Contact Details & Web Profiles
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="email"
                label="Institutional Email"
                name="institutionalEmail"
                defaultValue={initialData?.institutionalEmail || ""}
                placeholder="e.g. name@domain.com"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="email"
                label="Personal Email"
                name="personalEmail"
                defaultValue={initialData?.personalEmail || ""}
                placeholder="e.g. name@gmail.com"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                defaultValue={initialData?.phone || ""}
                placeholder="e.g. +54 221 ..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="url"
                label="Personal Web Page URL"
                name="webPage"
                defaultValue={initialData?.webPage || ""}
                placeholder="e.g. https://..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="ORCID ID"
                name="orcid"
                defaultValue={initialData?.orcid || ""}
                placeholder="e.g. 0000-0002-1825-0097"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="url"
                label="DBLP Profile Link"
                name="dblpProfile"
                defaultValue={initialData?.dblpProfile || ""}
                placeholder="e.g. https://dblp.org/pid/..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="url"
                label="Google Scholar URL"
                name="googleResearchProfile"
                defaultValue={initialData?.googleResearchProfile || ""}
                placeholder="e.g. https://scholar.google.com/citations?..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="url"
                label="ResearchGate URL"
                name="researchGateProfile"
                defaultValue={initialData?.researchGateProfile || ""}
                placeholder="e.g. https://www.researchgate.net/profile/..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="url"
                label="Avatar Image URL"
                name="avatarUrl"
                defaultValue={initialData?.avatarUrl || ""}
                placeholder="e.g. https://..."
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Dynamic Classification Tags */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Research Classification Tags
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TagWidget
              initialTags={initialData?.tags || []}
              placeholder="Add academic or research interests..."
            />
          </Box>
        </CardContent>
      </Card>
      {/* 4. Bilingual Biographies & General Notes */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Bilingual CV & Research Summaries
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Short CV (English)"
                name="shortCvInEnglish"
                defaultValue={initialData?.shortCvInEnglish || ""}
                placeholder="Write a concise professional biography in English..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Short CV (Spanish)"
                name="shortCvInSpanish"
                defaultValue={initialData?.shortCvInSpanish || ""}
                placeholder="Escriba una biografia profesional breve en Espanol..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  bgcolor: "background.paper",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Research Interests (English - ACM CCS Classification)
                  </Typography>

                  {/* Hidden form input holding serialized array for actual POST submit */}
                  <input type="hidden" name="interestsInEnglish" value={JSON.stringify(acmInterests)} />

                  {/* Display legacy warning if needed */}
                  {isLegacyText && acmInterests.length === 0 ? (
                    <Box
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "warning.light",
                        bgcolor: "rgba(247, 144, 9, 0.03)",
                        borderRadius: 1.5,
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          color: "warning.dark",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Legacy Text Interests Found:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.primary",
                          fontStyle: "italic",
                          display: "block",
                          wordBreak: "break-word",
                        }}
                      >
                        "{initialData.interestsInEnglish}"
                      </Typography>
                    </Box>
                  ) : null}

                  {/* Active ACM Categories list */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                    {acmInterests.length === 0 && (!isLegacyText || acmInterests.length > 0) ? (
                      <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                        No categories selected.
                      </Typography>
                    ) : (
                      acmInterests.map((id) => (
                        <Chip
                          key={id}
                          label={getAcmCcsPath(id).join(" > ")}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ height: 22, fontSize: "0.72rem", borderRadius: 1 }}
                        />
                      ))
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setIsAcmSelectorOpen(true)}
                    sx={{ textTransform: "none", fontWeight: "bold", fontSize: "0.72rem", py: 0.25 }}
                  >
                    {acmInterests.length > 0
                      ? "Edit Classifications"
                      : isLegacyText
                      ? "Migrate to ACM Classification"
                      : "Select ACM Categories"}
                  </Button>
                </Box>
              </Box>

              {/* Modal Dialog housing the Selector */}
              <Dialog
                open={isAcmSelectorOpen}
                onClose={() => setIsAcmSelectorOpen(false)}
                maxWidth="md"
                fullWidth
                sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    p: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Select Research Interests (ACM CCS Taxonomy)
                  </Typography>
                  <Button
                    onClick={() => setIsAcmSelectorOpen(false)}
                    variant="contained"
                    size="small"
                    sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1.5 }}
                  >
                    Done
                  </Button>
                </Box>
                <DialogContent sx={{ p: 3 }}>
                  <AcmCcsSelector
                    initialValue={JSON.stringify(acmInterests)}
                    onChange={(newIds) => setAcmInterests(newIds)}
                  />
                </DialogContent>
              </Dialog>
            </Grid>

            {/* Hidden input to preserve Spanish interests in DB without cluttering form */}
            <input type="hidden" name="interestsInSpanish" value={initialData?.interestsInSpanish || ""} />

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="General Notes"
                name="notes"
                defaultValue={initialData?.notes || ""}
                placeholder="Any additional system administrative notes..."
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Form Submission Action Buttons */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          component={Link}
          href={initialData ? `/members/${initialData.slug}` : "/members"}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold", px: 4, py: 1 }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="contained"
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold", px: 4, py: 1 }}
        >
          {isSubmitting ? "Saving Profile..." : initialData ? "Save Changes" : "Create Profile"}
        </Button>
      </Box>
    </Box>
  );
}
