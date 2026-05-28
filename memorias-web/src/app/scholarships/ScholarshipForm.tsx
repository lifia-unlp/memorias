"use client";

import React, { useState, useEffect } from "react";
import { createScholarship, updateScholarship } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TagWidget } from "@/components/TagWidget";
import { MemberSelector } from "@/components/reusable/MemberSelector";
import { ProjectSelector } from "@/components/reusable/ProjectSelector";
import { ThesisSelector } from "@/components/reusable/ThesisSelector";
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
  InputAdornment,
  Checkbox,
  Avatar,
  MenuItem,
} from "@mui/material";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  positionAtLab: string | null;
}

interface Project {
  id: string;
  title: string;
  slug: string;
}

interface Thesis {
  id: string;
  title: string;
  slug: string;
}

interface ScholarshipFormProps {
  initialData?: any;
  members: Member[];
  projects: Project[];
  theses?: Thesis[];
  types: string[];
}

export function ScholarshipForm({
  initialData,
  members,
  projects,
  theses = [],
  types,
}: ScholarshipFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startDateType, setStartDateType] = useState(initialData?.startDate ? "date" : "text");
  const [endDateType, setEndDateType] = useState(initialData?.endDate ? "date" : "text");

  // Core States
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugOverridden, setIsSlugOverridden] = useState(
    initialData ? true : false
  );
  const [type, setType] = useState(initialData?.type || "");

  // Multi-selection states
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialData?.members?.map((m: any) => m.id) || []
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    initialData?.projects?.map((p: any) => p.id) || []
  );
  const [selectedThesisIds, setSelectedThesisIds] = useState<string[]>(
    initialData?.theses?.map((t: any) => t.id) || []
  );

  // Search queries
  const [memberSearch, setMemberSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [thesisSearch, setThesisSearch] = useState("");

  // Auto-generate slug from title
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

  const handleToggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleThesis = (id: string) => {
    setSelectedThesisIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    
    // Explicitly override connected relations arrays
    formData.delete("members");
    selectedMemberIds.forEach((id) => formData.append("members", id));

    formData.delete("projects");
    selectedProjectIds.forEach((id) => formData.append("projects", id));

    formData.delete("theses");
    selectedThesisIds.forEach((id) => formData.append("theses", id));

    try {
      let res;
      if (initialData) {
        res = await updateScholarship(initialData.id, formData);
      } else {
        res = await createScholarship(formData);
      }

      if (res && res.success === false) {
        if (res.duplicate) {
          const choice = confirm(
            `${res.error}\n\nDo you want to save this scholarship entry anyway?`
          );
          if (choice) {
            formData.append("ignoreDuplicateCheck", "true");
            let bypassRes;
            if (initialData) {
              bypassRes = await updateScholarship(initialData.id, formData);
            } else {
              bypassRes = await createScholarship(formData);
            }
            if (bypassRes && bypassRes.success === false) {
              setErrorMsg(bypassRes.error || "Failed to save scholarship.");
            } else {
              router.push(initialData ? `/scholarships/${formData.get("slug")}` : "/scholarships");
            }
          }
        } else {
          setErrorMsg(res.error || "Failed to save scholarship.");
        }
      } else {
        router.push(initialData ? `/scholarships/${formData.get("slug")}` : "/scholarships");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save scholarship record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filters lists
  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredTheses = theses.filter((t) =>
    t.title.toLowerCase().includes(thesisSearch.toLowerCase())
  );

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
            Core Scholarship Details
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Scholarship Title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CONICET Doctoral Scholarship in Information Systems"
                size="small"
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
                placeholder="e.g. conicet-doctoral-scholarship"
                size="small"
                helperText="Generates the URL /scholarships/[slug] for this scholarship. Custom slugs are maintained unless reset."
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
                            const generated = title
                              .toLowerCase()
                              .trim()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "");
                            setSlug(generated);
                          }}
                        >
                          Reset Auto
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Student Name"
                name="student"
                defaultValue={initialData?.student || ""}
                placeholder="e.g. Laura G. Rossi"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Scholarship Type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                size="small"
              >
                <MenuItem value="">Select Type</MenuItem>
                {types.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Funding Agency"
                name="fundingAgency"
                defaultValue={initialData?.fundingAgency || ""}
                placeholder="e.g. CONICET, ANPCyT, UNLP"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 2. Supervisors Info */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Directors & Committee
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Director Name"
                name="director"
                defaultValue={initialData?.director || ""}
                placeholder="e.g. Alejandro Fernandez"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Co-Director Name"
                name="coDirector"
                defaultValue={initialData?.coDirector || ""}
                placeholder="e.g. Jose Delle Ville"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 3. Timelines */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Timeline & Duration
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type={startDateType}
                label="Start Date"
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type={endDateType}
                label="End Date (Expected)"
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
          </Grid>
        </CardContent>
      </Card>
      {/* 4. Summary */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Summary
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              name="summary"
              defaultValue={initialData?.summary || ""}
              placeholder="Provide a detailed overview of the scholarship objectives, scope, research topic, and milestones..."
            />
          </Box>
        </CardContent>
      </Card>

      {/* 5. Research Topics */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Research Topics
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TagWidget
              initialTags={initialData?.tags || []}
              placeholder="Add scholarship fields and keywords..."
            />
          </Box>
        </CardContent>
      </Card>

      {/* 6. Involved Lab Members Selection */}
      <MemberSelector
        items={members}
        selectedIds={selectedMemberIds}
        onChange={setSelectedMemberIds}
        layout="grid"
      />

      {/* 7. Related Projects Selection */}
      <ProjectSelector
        items={projects}
        selectedIds={selectedProjectIds}
        onChange={setSelectedProjectIds}
        layout="grid"
      />

      {/* 8. Related Theses Selection */}
      <ThesisSelector
        items={theses}
        selectedIds={selectedThesisIds}
        onChange={setSelectedThesisIds}
        layout="grid"
      />
      {/* Form Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          component={Link}
          href={initialData ? `/scholarships/${initialData.slug}` : "/scholarships"}
          sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: "bold" }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: "bold" }}
        >
          {isSubmitting ? "Saving Scholarship..." : initialData ? "Save Changes" : "Create Scholarship"}
        </Button>
      </Box>
    </Box>
  );
}
