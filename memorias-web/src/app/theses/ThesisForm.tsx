"use client";

import React, { useState, useEffect } from "react";
import { createThesis, updateThesis } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  InputAdornment,
  FormControlLabel,
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

interface Publication {
  id: string;
  title: string;
  year: number;
}

interface ThesisFormProps {
  initialData?: any;
  members: Member[];
  projects: Project[];
  publications: Publication[];
  levels: string[];
}

export function ThesisForm({
  initialData,
  members,
  projects,
  publications,
  levels,
}: ThesisFormProps) {
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
  const [level, setLevel] = useState(initialData?.level || "");
  const [progress, setProgress] = useState(
    initialData?.progress !== undefined ? String(initialData.progress) : ""
  );

  // Multi-selection states
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialData?.members?.map((m: any) => m.id) || []
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    initialData?.projects?.map((p: any) => p.id) || []
  );
  const [selectedPublicationIds, setSelectedPublicationIds] = useState<string[]>(
    initialData?.publications?.map((p: any) => p.id) || []
  );

  // Search queries
  const [memberSearch, setMemberSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [publicationSearch, setPublicationSearch] = useState("");

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

  const handleTogglePublication = (id: string) => {
    setSelectedPublicationIds((prev) =>
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

    formData.delete("publications");
    selectedPublicationIds.forEach((id) => formData.append("publications", id));
    formData.set("featured", String(featured));

    try {
      let res;
      if (initialData) {
        res = await updateThesis(initialData.id, formData);
      } else {
        res = await createThesis(formData);
      }

      if (res && res.success === false) {
        if (res.duplicate) {
          const choice = confirm(
            `${res.error}\n\nDo you want to save this thesis entry anyway?`
          );
          if (choice) {
            formData.append("ignoreDuplicateCheck", "true");
            let bypassRes;
            if (initialData) {
              bypassRes = await updateThesis(initialData.id, formData);
            } else {
              bypassRes = await createThesis(formData);
            }
            if (bypassRes && bypassRes.success === false) {
              setErrorMsg(bypassRes.error || "Failed to save thesis.");
            } else {
              router.push(initialData ? `/theses/${formData.get("slug")}` : "/theses");
            }
          }
        } else {
          setErrorMsg(res.error || "Failed to save thesis.");
        }
      } else {
        router.push(initialData ? `/theses/${formData.get("slug")}` : "/theses");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save thesis record.");
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

  const filteredPublications = publications.filter((p) =>
    p.title.toLowerCase().includes(publicationSearch.toLowerCase())
  );

  const progressOptions = Array.from({ length: 11 }, (_, i) => i * 10);

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
            Core Thesis Details
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Thesis Title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dynamic User Modelling in Virtual Environments"
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
                placeholder="e.g. dynamic-user-modelling-virtual-environments"
                size="small"
                helperText="Generates the URL /theses/[slug] for this thesis. Custom slugs are maintained unless reset."
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

            {/* Featured Thesis Switcher */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      name="featured"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        Featured Thesis
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        Highlight this thesis on the home page as part of the selected scientific research feed.
                      </Typography>
                    </Box>
                  }
                />
              </Box>
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
                fullWidth
                label="Career Name"
                name="career"
                defaultValue={initialData?.career || ""}
                placeholder="e.g. Doctorado en Ciencias Informáticas"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Thesis Level"
                name="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                size="small"
              >
                <MenuItem value="">Select Level</MenuItem>
                {levels.map((lvl) => (
                  <MenuItem key={lvl} value={lvl}>
                    {lvl}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Thesis Progress"
                name="progress"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                size="small"
              >
                <MenuItem value="">Select Progress</MenuItem>
                {progressOptions.map((pct) => (
                  <MenuItem key={pct} value={String(pct)}>
                    {pct}% {pct === 100 ? "(Completed)" : pct === 0 ? "(Just Started)" : "(In Progress)"}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 2. Advisors & Committee Info */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Advisors & Thesis Committee
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

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Other Advisors (comma separated)"
                name="otherAdvisors"
                defaultValue={initialData?.otherAdvisors || ""}
                placeholder="e.g. Carlos R. Smith, Maria J. Garcia"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 3. Resources & Timelines */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Resources & Timelines
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="End Date (or Defense Date)"
                name="endDate"
                defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="url"
                label="Thesis Manuscript PDF Link"
                name="reportUrl"
                defaultValue={initialData?.reportUrl || ""}
                placeholder="e.g. https://sedici.unlp.edu.ar/handle/..."
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="url"
                label="Thesis Website"
                name="website"
                defaultValue={initialData?.website || ""}
                placeholder="e.g. https://github.com/..."
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 4. Associate Members Multi-Selection */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyItems: "center", justifyContent: "between", alignItems: { xs: "stretch", md: "center" }, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3, gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                Associate Lab Members
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select researchers associated with this thesis.
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              sx={{ width: { xs: "100%", md: 260 } }}
            />
          </Box>

          {filteredMembers.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 2 }}>
              No researchers found.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
              <Grid container spacing={2}>
                {filteredMembers.map((member) => {
                  const isChecked = selectedMemberIds.includes(member.id);
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
                      <Box
                        onClick={() => handleToggleMember(member.id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isChecked ? "primary.main" : "divider",
                          bgcolor: isChecked ? "action.selected" : "background.paper",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                        {member.avatarUrl ? (
                          <Avatar
                            src={member.avatarUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            sx={{ width: 32, height: 32 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem", fontWeight: "bold" }}>
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </Avatar>
                        )}
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
                            {member.firstName} {member.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.65rem" }}>
                            {member.positionAtLab || "Researcher"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* 5. Linked Projects Multi-Selection */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyItems: "center", justifyContent: "between", alignItems: { xs: "stretch", md: "center" }, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3, gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                Linked Projects
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select research projects connected to this thesis.
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              sx={{ width: { xs: "100%", md: 260 } }}
            />
          </Box>

          {filteredProjects.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 2 }}>
              No projects found.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
              <Grid container spacing={2}>
                {filteredProjects.map((proj) => {
                  const isChecked = selectedProjectIds.includes(proj.id);
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={proj.id}>
                      <Box
                        onClick={() => handleToggleProject(proj.id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isChecked ? "primary.main" : "divider",
                          bgcolor: isChecked ? "action.selected" : "background.paper",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
                            {proj.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.65rem" }}>
                            Slug: {proj.slug}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* 6. Linked Publications Multi-Selection */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyItems: "center", justifyContent: "between", alignItems: { xs: "stretch", md: "center" }, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3, gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                Linked Publications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select associated scientific papers or publications.
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search publications..."
              value={publicationSearch}
              onChange={(e) => setPublicationSearch(e.target.value)}
              sx={{ width: { xs: "100%", md: 260 } }}
            />
          </Box>

          {filteredPublications.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 2 }}>
              No publications found.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
              <Grid container spacing={2}>
                {filteredPublications.map((pub) => {
                  const isChecked = selectedPublicationIds.includes(pub.id);
                  return (
                    <Grid size={{ xs: 12 }} key={pub.id}>
                      <Box
                        onClick={() => handleTogglePublication(pub.id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isChecked ? "primary.main" : "divider",
                          bgcolor: isChecked ? "action.selected" : "background.paper",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
                            {pub.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.65rem" }}>
                            Year: {pub.year}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* 7. Abstract Summary & Tagging */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3 }}>
            Thesis Abstract & Classification
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Thesis Abstract/Summary"
                name="summary"
                defaultValue={initialData?.summary || ""}
                placeholder="Provide a detailed abstract summary of the thesis scope, methodology, and scientific contributions..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Classification Keywords (comma separated)"
                name="keywords"
                defaultValue={initialData?.keywords || ""}
                placeholder="e.g. HCI, Knowledge Management, Collaborative Learning"
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
              placeholder="Add thesis keywords and fields..."
            />
          </Box>
        </CardContent>
      </Card>
      {/* Form Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          component={Link}
          href={initialData ? `/theses/${initialData.slug}` : "/theses"}
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
          {isSubmitting ? "Saving Thesis..." : initialData ? "Save Changes" : "Create Thesis"}
        </Button>
      </Box>
    </Box>
  );
}
