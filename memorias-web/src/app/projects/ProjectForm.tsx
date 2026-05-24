"use client";

import React, { useState, useEffect } from "react";
import { createProject, updateProject } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TagWidget } from "@/components/TagWidget";
import { MemberSelector } from "@/components/reusable/MemberSelector";
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
  FormControlLabel,
  Checkbox,
  Avatar,
} from "@mui/material";

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
      let res;
      if (initialData) {
        res = await updateProject(initialData.id, formData);
      } else {
        res = await createProject(formData);
      }

      if (res && res.success === false) {
        if (res.duplicate) {
          const choice = confirm(
            `${res.error}\n\nDo you want to save this project entry anyway?`
          );
          if (choice) {
            formData.append("ignoreDuplicateCheck", "true");
            let bypassRes;
            if (initialData) {
              bypassRes = await updateProject(initialData.id, formData);
            } else {
              bypassRes = await createProject(formData);
            }
            if (bypassRes && bypassRes.success === false) {
              setErrorMsg(bypassRes.error || "Failed to save project.");
            } else {
              router.push(initialData ? `/projects/${formData.get("slug")}` : "/projects");
            }
          }
        } else {
          setErrorMsg(res.error || "Failed to save project.");
        }
      } else {
        router.push(initialData ? `/projects/${formData.get("slug")}` : "/projects");
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
            Core Project Details
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Project Title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Collaborative Knowledge Management Systems"
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
                placeholder="e.g. collaborative-knowledge-systems"
                size="small"
                helperText="Generates the URL /projects/[slug] for this project. Custom slugs are maintained unless reset."
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

            {/* Featured Project Switcher */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.15)" : "rgba(25, 118, 210, 0.04)",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Featured Project
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Highlight this project on the home page as part of the selected scientific research feed.
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Project Code"
                name="code"
                defaultValue={initialData?.code || ""}
                placeholder="e.g. I110, PIN-2026"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Responsible Group"
                name="responsibleGroup"
                defaultValue={initialData?.responsibleGroup || ""}
                placeholder="e.g. Lab, Research Group"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                required
                defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="endDate"
                required
                defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 2. Funding & Administration */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Funding & Administration
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Funding Agency"
                name="fundingAgency"
                defaultValue={initialData?.fundingAgency || ""}
                placeholder="e.g. UNLP, CONICET, ANPCyT"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Funding Amount"
                name="amount"
                defaultValue={initialData?.amount || ""}
                placeholder="e.g. $5,000,000 ARS"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="url"
                label="Project Website Link"
                name="website"
                defaultValue={initialData?.website || ""}
                placeholder="e.g. https://domain.com/projects/..."
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 3. Summary */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Summary
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            name="summary"
            defaultValue={initialData?.summary || ""}
            placeholder="Provide a detailed overview of the research scope, objectives, and findings..."
            size="small"
          />
        </CardContent>
      </Card>

      {/* 4. Research Topics */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Research Topics
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TagWidget
              initialTags={initialData?.tags || []}
              placeholder="Add project keywords and fields..."
            />
          </Box>
        </CardContent>
      </Card>

      {/* 5. Involved Lab Members Selection */}
      <MemberSelector
        items={members}
        selectedIds={selectedMemberIds}
        onChange={setSelectedMemberIds}
        layout="grid"
      />
      {/* Form Actions */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          component={Link}
          href={initialData ? `/projects/${initialData.slug}` : "/projects"}
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
          {isSubmitting ? "Saving Project..." : initialData ? "Save Changes" : "Create Project"}
        </Button>
      </Box>
    </Box>
  );
}
