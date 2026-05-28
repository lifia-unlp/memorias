import React from "react";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import { LinkButton } from "@/components/reusable/LinkComponents";
import { matchQueryTokens } from "@/lib/search";
import Link from "next/link";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  Chip,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
} from "@mui/material";
import { jsonToBibtex } from "@/lib/bibtex";
import { formatCitation } from "@/lib/citations";
import { CopyCitationButton } from "../publications/CopyCitationButton";

type SearchParams = Promise<{ q?: string; type?: string; page?: string; limit?: string }>;

interface SearchResultItem {
  id: string;
  type: "member" | "project" | "thesis" | "scholarship" | "publication";
  slug: string;
  updatedAt: Date;
  original: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const metadata = {
  title: "Global Search | Memorias",
  description: "Search all members, research projects, defend theses, scholarships, and scientific publications across the repository.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const typeFilter = resolvedParams.type || "all";
  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedParams.limit || "10", 10) || 10;

  // Fetch all objects to search in memory (enabling deep partial matching and case insensitivity)
  const [members, projects, theses, scholarships, publications] = await Promise.all([
    prisma.member.findMany(),
    prisma.project.findMany({
      include: {
        members: {
          select: {
            firstName: true,
            lastName: true,
            slug: true,
          },
        },
      },
    }),
    prisma.thesis.findMany(),
    prisma.scholarship.findMany(),
    prisma.publication.findMany(),
  ]);

  // Search filter implementation using multi-word, accent-insensitive tokenized matching
  const matchedMembers = members.filter((m) =>
    matchQueryTokens(q, [
      m.firstName,
      m.lastName,
      m.tags,
      m.interestsInEnglish,
      m.interestsInSpanish,
    ])
  );

  const matchedProjects = projects.filter((p) =>
    matchQueryTokens(q, [
      p.title,
      p.code,
      p.director,
      p.coDirector,
      p.summary,
      p.fundingAgency,
      p.tags,
    ])
  );

  const matchedTheses = theses.filter((t) =>
    matchQueryTokens(q, [
      t.title,
      t.student,
      t.director,
      t.coDirector,
      t.summary,
      t.career,
      t.tags,
    ])
  );

  const matchedScholarships = scholarships.filter((s) =>
    matchQueryTokens(q, [
      s.title,
      s.student,
      s.director,
      s.coDirector,
      s.summary,
      s.type,
      s.tags,
    ])
  );

  const matchedPublications = publications.filter((p) =>
    matchQueryTokens(q, [p.title, p.authors, p.tags])
  );

  // Calculate dynamic category counts
  const counts = {
    all:
      matchedMembers.length +
      matchedProjects.length +
      matchedTheses.length +
      matchedScholarships.length +
      matchedPublications.length,
    member: matchedMembers.length,
    project: matchedProjects.length,
    thesis: matchedTheses.length,
    scholarship: matchedScholarships.length,
    publication: matchedPublications.length,
  };

  // Map database elements to the unified SearchResultItem interface
  const mappedMembers: SearchResultItem[] = matchedMembers.map((m) => ({
    id: m.id,
    type: "member",
    slug: m.slug,
    updatedAt: m.updatedAt,
    original: m,
  }));

  const mappedProjects: SearchResultItem[] = matchedProjects.map((p) => ({
    id: p.id,
    type: "project",
    slug: p.slug,
    updatedAt: p.updatedAt,
    original: p,
  }));

  const mappedTheses: SearchResultItem[] = matchedTheses.map((t) => ({
    id: t.id,
    type: "thesis",
    slug: t.slug,
    updatedAt: t.updatedAt,
    original: t,
  }));

  const mappedScholarships: SearchResultItem[] = matchedScholarships.map((s) => ({
    id: s.id,
    type: "scholarship",
    slug: s.slug,
    updatedAt: s.updatedAt,
    original: s,
  }));

  const mappedPublications: SearchResultItem[] = matchedPublications.map((p) => ({
    id: p.id,
    type: "publication",
    slug: p.slug,
    updatedAt: p.updatedAt,
    original: p,
  }));

  // Select filtered items based on active tab
  let filteredResults: SearchResultItem[] = [];
  if (typeFilter === "all") {
    filteredResults = [
      ...mappedMembers,
      ...mappedProjects,
      ...mappedTheses,
      ...mappedScholarships,
      ...mappedPublications,
    ];
  } else if (typeFilter === "member") {
    filteredResults = mappedMembers;
  } else if (typeFilter === "project") {
    filteredResults = mappedProjects;
  } else if (typeFilter === "thesis") {
    filteredResults = mappedTheses;
  } else if (typeFilter === "scholarship") {
    filteredResults = mappedScholarships;
  } else if (typeFilter === "publication") {
    filteredResults = mappedPublications;
  }

  // Sort descending by updatedAt (represents lastUpdated)
  filteredResults.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Paginate results
  const totalPages = Math.ceil(filteredResults.length / limit);
  const paginatedResults = filteredResults.slice((page - 1) * limit, page * limit);



  const filterTabs = [
    { label: "All", type: "all", count: counts.all },
    { label: "Researchers", type: "member", count: counts.member },
    { label: "Projects", type: "project", count: counts.project },
    { label: "Theses", type: "thesis", count: counts.thesis },
    { label: "Scholarships", type: "scholarship", count: counts.scholarship },
    { label: "Publications", type: "publication", count: counts.publication },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      {/* Hero Banner Section */}
      <Box
        data-component-semantics="Hero banner"
        sx={{
          background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
          color: "common.white",
          py: 6,
          px: 3,
          boxShadow: "inset 0px -4px 10px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 10 }}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h1" sx={{ color: "common.white", mb: 1, fontSize: { xs: "2rem", md: "2.5rem" } }}>
              Global Search
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.85)" }}>
              Explore researchers, scientific projects, defended theses, scholarship opportunities, and publications in our institutional repository.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Layout Container */}
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        
        {/* Inline Search Bar Form */}
        <Card sx={{ p: 2, boxShadow: 1 }}>
          <Box
            component="form"
            method="GET"
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <input type="hidden" name="type" value={typeFilter} />
            <TextField
              fullWidth
              size="small"
              name="q"
              defaultValue={q}
              placeholder="Search across all records by name, title, keywords, authors, notes..."
              variant="outlined"
            />

            <FormControl size="small" sx={{ width: { xs: "100%", md: 160 }, shrink: 0 }}>
              <Select name="limit" defaultValue={limit.toString()}>
                <MenuItem value="10">10 per page</MenuItem>
                <MenuItem value="20">20 per page</MenuItem>
                <MenuItem value="30">30 per page</MenuItem>
                <MenuItem value="50">50 per page</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", md: "auto" } }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: 2,
                  fontWeight: "bold",
                  flexGrow: { xs: 1, md: 0 },
                  whiteSpace: "nowrap",
                }}
              >
                Search
              </Button>

              {(q || typeFilter !== "all" || limit !== 10) && (
                <LinkButton
                  href="/search"
                  variant="text"
                  color="inherit"
                  sx={{
                    fontWeight: "bold",
                    borderRadius: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  Clear
                </LinkButton>
              )}
            </Box>
          </Box>
        </Card>

        {/* Dynamic Category Chips Filters */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          {filterTabs.map((tab) => {
            const isActive = typeFilter === tab.type;
            return (
              <LinkButton
                key={tab.type}
                href={`/search?q=${encodeURIComponent(q)}&type=${tab.type}&limit=${limit}`}
                variant={isActive ? "contained" : "outlined"}
                color={isActive ? "primary" : "inherit"}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: isActive ? 800 : 700,
                  fontSize: "0.8rem",
                  px: 2.25,
                  py: 0.75,
                  textTransform: "none",
                  boxShadow: isActive ? 2 : 0,
                }}
              >
                {tab.label} ({tab.count})
              </LinkButton>
            );
          })}
        </Box>

        {/* Results Info Bar */}
        {filteredResults.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Found {filteredResults.length} matching results, sorted descending by last updated.
          </Typography>
        )}

        {/* Search Results List */}
        {paginatedResults.length === 0 ? (
          <Card
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography variant="h3">No matching records found</Typography>
            <Typography variant="body2" color="text.secondary">
              We could not find any records matching your search queries. Try broadening your keywords.
            </Typography>
          </Card>
        ) : (
          <Box>
            <Grid container spacing={3.5}>
              {paginatedResults.map((item) => {
                // Helper to render type-specific cards
                const renderCard = () => {
                  switch (item.type) {
                    case "member": {
                      const m = item.original;
                      return (
                        <Card
                          data-component-semantics="Member search result card"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            p: 3,
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "4px",
                              background: "linear-gradient(90deg, var(--mui-palette-secondary-main), var(--mui-palette-primary-main) 40%)",
                              transform: "scaleX(0)",
                              transformOrigin: "left",
                              transition: "transform 0.3s ease",
                              zIndex: 2,
                            },
                            "&:hover::before": {
                              transform: "scaleX(1)",
                            },
                          }}
                        >
                          <Link
                            href={`/members/${m.slug}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 3,
                            }}
                          />
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, position: "relative", zIndex: 2 }}>
                            <Avatar
                              src={m.avatarUrl || undefined}
                              alt={`${m.firstName} ${m.lastName}`}
                              sx={{
                                width: 56,
                                height: 56,
                                bgcolor: "primary.light",
                                color: "primary.main",
                                fontWeight: "bold",
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              {!m.avatarUrl && `${m.firstName[0]}${m.lastName[0]}`}
                            </Avatar>
                            <Box sx={{ overflow: "hidden" }}>
                              <Typography
                                variant="h3"
                                sx={{
                                  fontSize: "1.05rem",
                                  fontWeight: "bold",
                                  mb: 0.5,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  "&:hover": { color: "primary.main" },
                                  transition: "color 0.2s",
                                }}
                              >
                                {m.firstName} {m.lastName}
                              </Typography>
                              {m.positionAtLab && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "secondary.main",
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                    display: "block",
                                  }}
                                >
                                  {m.positionAtLab}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              borderTop: "1px solid",
                              borderColor: "divider",
                              pt: 2,
                              mb: 2,
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.75,
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            {m.highestDegree && (
                              <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Degree:
                                </Typography>
                                <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {m.highestDegree}
                                </Typography>
                              </Box>
                            )}
                            {m.positionAtCONICET && (
                              <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  CONICET:
                                </Typography>
                                <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {m.positionAtCONICET}
                                </Typography>
                              </Box>
                            )}
                            {m.institutionalEmail && (
                              <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Email:
                                </Typography>
                                <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "primary.main" }}>
                                  {m.institutionalEmail}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {m.tags.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mt: "auto",
                                pt: 2,
                                borderTop: "1px solid",
                                borderColor: "divider",
                                position: "relative",
                                zIndex: 4,
                              }}
                            >
                              {m.tags.slice(0, 3).map((tag: string, idx: number) => (
                                <Link key={idx} href={`/tags/${tag}`} style={{ textDecoration: "none" }}>
                                  <Chip
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.625rem",
                                      height: 18,
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "primary.light",
                                      bgcolor: "primary.light",
                                      color: "primary.main",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      "&:hover": {
                                        bgcolor: "primary.main",
                                        color: "common.white",
                                      },
                                    }}
                                    data-component-semantics="Tag badge"
                                  />
                                </Link>
                              ))}
                              {m.tags.length > 3 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.625rem",
                                    fontWeight: "bold",
                                    color: "text.secondary",
                                    alignSelf: "center",
                                    ml: 0.5,
                                  }}
                                >
                                  +{m.tags.length - 3} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Card>
                      );
                    }

                    case "project": {
                      const project = item.original;
                      const startStr = project.startDate
                        ? new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                        : "N/D";
                      const endStr = project.endDate
                        ? new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                        : "Ongoing";

                      return (
                        <Card
                          data-component-semantics="Project search result card"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            p: 3,
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "4px",
                              background: "linear-gradient(90deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
                              transform: "scaleX(0)",
                              transformOrigin: "left",
                              transition: "transform 0.3s ease",
                              zIndex: 2,
                            },
                            "&:hover::before": {
                              transform: "scaleX(1)",
                            },
                            "&:hover .project-card-title": {
                              color: "primary.main",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          <Link
                            href={`/projects/${project.slug}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 3,
                            }}
                          />

                          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, position: "relative", zIndex: 2 }}>
                            <Typography
                              variant="h3"
                              sx={{
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                lineHeight: 1.4,
                              }}
                            >
                              <Box
                                component="span"
                                className="project-card-title"
                                sx={{
                                  color: "text.primary",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  transition: "color 0.2s",
                                }}
                              >
                                {project.title}
                              </Box>
                            </Typography>
                            {project.code && (
                              <Chip
                                label={`Code: ${project.code}`}
                                size="small"
                                sx={{
                                  fontWeight: "bold",
                                  fontSize: "0.625rem",
                                  height: 18,
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  bgcolor: "action.hover",
                                  color: "text.secondary",
                                  flexShrink: 0,
                                }}
                                data-component-semantics="Metadata badge"
                              />
                            )}
                          </Box>

                          <Box
                            sx={{
                              bgcolor: "action.hover",
                              p: 2,
                              borderRadius: 2.5,
                              border: "1px solid",
                              borderColor: "divider",
                              fontSize: "0.75rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              mb: 2,
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 0.5, color: "text.secondary" }}>
                              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                                Timeline:
                              </Typography>
                              <Typography variant="caption">
                                {startStr} - {endStr}
                              </Typography>
                            </Box>

                            {(project.director || project.coDirector) && (
                              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                {project.director && (
                                  <Typography variant="caption" sx={{ color: "text.primary" }}>
                                    <strong>Director:</strong> {project.director}
                                  </Typography>
                                )}
                                {project.coDirector && (
                                  <Typography variant="caption" sx={{ color: "text.primary" }}>
                                    <strong>Co-Director:</strong> {project.coDirector}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>

                          {project.summary && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 3,
                                lineHeight: 1.6,
                                fontSize: "0.8rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                position: "relative",
                                zIndex: 2,
                              }}
                            >
                              {project.summary}
                            </Typography>
                          )}

                          {project.members && project.members.length > 0 && (
                            <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2, mt: "auto", mb: project.tags.length > 0 ? 2 : 0, position: "relative", zIndex: 4 }}>
                              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary", display: "block", mb: 0.5 }}>
                                Associated Members:
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                                {project.members.map((member: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                  <React.Fragment key={member.slug}>
                                    <Link
                                      href={`/members/${member.slug}`}
                                      style={{ textDecoration: "none", position: "relative", zIndex: 4 }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: "bold",
                                          color: "primary.main",
                                          "&:hover": { textDecoration: "underline" },
                                        }}
                                      >
                                        {member.firstName} {member.lastName}
                                      </Typography>
                                    </Link>
                                    {i < project.members.length - 1 && (
                                      <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                                        ,
                                      </Typography>
                                    )}
                                  </React.Fragment>
                                ))}
                              </Box>
                            </Box>
                          )}

                          {project.tags.length > 0 && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, pt: (project.members && project.members.length > 0) ? 0 : 2, mt: (project.members && project.members.length > 0) ? 0 : "auto", position: "relative", zIndex: 4 }}>
                              {project.tags.slice(0, 4).map((tag: string) => (
                                <Link key={tag} href={`/tags/${tag}`} style={{ textDecoration: "none" }}>
                                  <Chip
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.625rem",
                                      height: 18,
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "primary.light",
                                      bgcolor: "primary.light",
                                      color: "primary.main",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      "&:hover": {
                                        bgcolor: "primary.main",
                                        color: "common.white",
                                      },
                                    }}
                                    data-component-semantics="Tag badge"
                                  />
                                </Link>
                              ))}
                            </Box>
                          )}
                        </Card>
                      );
                    }

                    case "thesis": {
                      const ths = item.original;
                      const startYearStr = ths.startDate
                        ? new Date(ths.startDate).getFullYear()
                        : "N/D";
                      const endYearStr = ths.endDate
                        ? new Date(ths.endDate).getFullYear()
                        : ths.progress === 100
                        ? "Completed"
                        : "Ongoing";

                      return (
                        <Card
                          data-component-semantics="Thesis search result card"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            p: 3,
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "4px",
                              background: "linear-gradient(90deg, var(--mui-palette-secondary-main), var(--mui-palette-primary-main) 40%)",
                              transform: "scaleX(0)",
                              transformOrigin: "left",
                              transition: "transform 0.3s ease",
                              zIndex: 2,
                            },
                            "&:hover::before": {
                              transform: "scaleX(1)",
                            },
                            "&:hover .thesis-card-title": {
                              color: "primary.main",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          <Link
                            href={`/theses/${ths.slug}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 3,
                            }}
                          />

                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5, position: "relative", zIndex: 2 }}>
                            {ths.level && (
                              <Chip
                                label={ths.level}
                                size="small"
                                sx={{
                                  fontSize: "0.625rem",
                                  fontWeight: "bold",
                                  border: "1px solid",
                                  borderColor: "divider",
                                  bgcolor: "action.hover",
                                  color: "text.secondary",
                                  textTransform: "uppercase",
                                  height: 18,
                                  borderRadius: 1,
                                }}
                                data-component-semantics="Metadata badge"
                              />
                            )}
                            {ths.progress !== null && (
                              <Chip
                                label={ths.progress === 100 ? "Completed" : `${ths.progress}% Progress`}
                                size="small"
                                sx={{
                                  fontSize: "0.625rem",
                                  fontWeight: "bold",
                                  border: "1px solid",
                                  borderColor: ths.progress === 100 ? "success.main" : "warning.main",
                                  bgcolor: ths.progress === 100 ? "success.light" : "warning.light",
                                  color: ths.progress === 100 ? "success.dark" : "warning.dark",
                                  height: 18,
                                  borderRadius: 1,
                                }}
                                data-component-semantics="Status badge"
                              />
                            )}
                          </Box>

                          <Typography
                            variant="h3"
                            sx={{
                              fontSize: "1.15rem",
                              fontWeight: "bold",
                              lineHeight: 1.3,
                              mb: 2,
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <Box
                              component="span"
                              className="thesis-card-title"
                              sx={{
                                color: "text.primary",
                                transition: "color 0.2s",
                              }}
                            >
                              {ths.title}
                            </Box>
                          </Typography>

                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              bgcolor: "action.hover",
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 2.5,
                              p: 2,
                              mb: 2,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                Timeline:
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.primary" }}>
                                {startYearStr} – {endYearStr}
                              </Typography>
                            </Box>

                            {ths.student && (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Student:
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.primary" }}>
                                  {ths.student}
                                </Typography>
                              </Box>
                            )}

                            {ths.director && (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Director:
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.primary" }}>
                                  {ths.director}
                                </Typography>
                              </Box>
                            )}

                            {ths.coDirector && (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Co-Director:
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.primary" }}>
                                  {ths.coDirector}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {ths.summary && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.5,
                                mb: 2,
                                position: "relative",
                                zIndex: 2,
                              }}
                            >
                              {ths.summary}
                            </Typography>
                          )}

                          {ths.progress !== null && ths.progress < 100 && (
                            <Box sx={{ mt: "auto", mb: 2, position: "relative", zIndex: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={ths.progress}
                                color="secondary"
                                sx={{ height: 4, borderRadius: 1 }}
                              />
                            </Box>
                          )}

                          {ths.tags.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mt: ths.progress !== null && ths.progress < 100 ? 0 : "auto",
                                pt: 2,
                                borderTop: "1px solid",
                                borderColor: "divider",
                                position: "relative",
                                zIndex: 4,
                              }}
                            >
                              {ths.tags.slice(0, 4).map((tag: string, idx: number) => (
                                <Link key={idx} href={`/tags/${tag}`} style={{ textDecoration: "none" }}>
                                  <Chip
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.625rem",
                                      height: 18,
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "primary.light",
                                      bgcolor: "primary.light",
                                      color: "primary.main",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      "&:hover": {
                                        bgcolor: "primary.main",
                                        color: "common.white",
                                      },
                                    }}
                                    data-component-semantics="Tag badge"
                                  />
                                </Link>
                              ))}
                              {ths.tags.length > 4 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.625rem",
                                    fontWeight: "bold",
                                    color: "text.secondary",
                                    alignSelf: "center",
                                    ml: 0.5,
                                  }}
                                >
                                  +{ths.tags.length - 4} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Card>
                      );
                    }

                    case "scholarship": {
                      const s = item.original;
                      const now = new Date();
                      const startYearStr = s.startDate
                        ? new Date(s.startDate).getFullYear()
                        : "N/D";
                      const isCompleted = s.endDate && new Date(s.endDate) < now;
                      const endYearStr = s.endDate
                        ? new Date(s.endDate).getFullYear()
                        : "Ongoing";

                      return (
                        <Card
                          data-component-semantics="Scholarship search result card"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            p: 3,
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "4px",
                              background: "linear-gradient(90deg, var(--mui-palette-secondary-main), var(--mui-palette-primary-main) 40%)",
                              transform: "scaleX(0)",
                              transformOrigin: "left",
                              transition: "transform 0.3s ease",
                              zIndex: 2,
                            },
                            "&:hover::before": {
                              transform: "scaleX(1)",
                            },
                            "&:hover .scholarship-card-title": {
                              color: "primary.main",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          <Link
                            href={`/scholarships/${s.slug}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 3,
                            }}
                          />

                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5, position: "relative", zIndex: 2 }}>
                            {s.type && (
                              <Chip
                                label={s.type}
                                size="small"
                                sx={{
                                  fontSize: "0.625rem",
                                  fontWeight: "bold",
                                  border: "1px solid",
                                  borderColor: "divider",
                                  bgcolor: "action.hover",
                                  color: "text.secondary",
                                  textTransform: "uppercase",
                                  height: 18,
                                  borderRadius: 1,
                                }}
                                data-component-semantics="Metadata badge"
                              />
                            )}
                            <Chip
                              label={isCompleted ? "Completed" : "Ongoing"}
                              size="small"
                              sx={{
                                fontSize: "0.625rem",
                                fontWeight: "bold",
                                border: "1px solid",
                                borderColor: isCompleted ? "success.main" : "warning.main",
                                bgcolor: isCompleted ? "success.light" : "warning.light",
                                color: isCompleted ? "success.dark" : "warning.dark",
                                height: 18,
                                borderRadius: 1,
                              }}
                              data-component-semantics="Status badge"
                            />
                          </Box>

                          <Typography
                            variant="h3"
                            sx={{
                              fontSize: "1.15rem",
                              fontWeight: "bold",
                              lineHeight: 1.3,
                              mb: 2,
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <Box
                              component="span"
                              className="scholarship-card-title"
                              sx={{
                                color: "text.primary",
                                transition: "color 0.2s",
                              }}
                            >
                              {s.title}
                            </Box>
                          </Typography>

                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              bgcolor: "action.hover",
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 2.5,
                              p: 2,
                              mb: 2,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                Timeline:
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.primary" }}>
                                {startYearStr} – {endYearStr}
                              </Typography>
                            </Box>

                            {s.student && (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Student:
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.primary" }}>
                                  {s.student}
                                </Typography>
                              </Box>
                            )}

                            {s.fundingAgency && (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Funding Agency:
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.primary" }}>
                                  {s.fundingAgency}
                                </Typography>
                              </Box>
                            )}

                            {s.director && (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Director:
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.primary" }}>
                                  {s.director}
                                </Typography>
                              </Box>
                            )}

                            {s.coDirector && (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                  Co-Director:
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.primary" }}>
                                  {s.coDirector}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {s.summary && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.5,
                                mb: 2,
                                position: "relative",
                                zIndex: 2,
                              }}
                            >
                              {s.summary}
                            </Typography>
                          )}

                          {s.tags.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mt: "auto",
                                pt: 2,
                                borderTop: "1px solid",
                                borderColor: "divider",
                                position: "relative",
                                zIndex: 4,
                              }}
                            >
                              {s.tags.slice(0, 4).map((tag: string, idx: number) => (
                                <Link key={idx} href={`/tags/${tag}`} style={{ textDecoration: "none" }}>
                                  <Chip
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.625rem",
                                      height: 18,
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "primary.light",
                                      bgcolor: "primary.light",
                                      color: "primary.main",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      "&:hover": {
                                        bgcolor: "primary.main",
                                        color: "common.white",
                                      },
                                    }}
                                    data-component-semantics="Tag badge"
                                  />
                                </Link>
                              ))}
                              {s.tags.length > 4 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.625rem",
                                    fontWeight: "bold",
                                    color: "text.secondary",
                                    alignSelf: "center",
                                    ml: 0.5,
                                  }}
                                >
                                  +{s.tags.length - 4} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Card>
                      );
                    }

                    case "publication": {
                      const pb = item.original;
                      const citation = formatCitation(pb, "apa");
                      const bibString = jsonToBibtex(pb);
                      const bibDownloadUrl = bibString
                        ? `data:text/plain;charset=utf-8,${encodeURIComponent(bibString)}`
                        : null;

                      return (
                        <Card
                          data-component-semantics="Publication search result card"
                          sx={{
                            width: "100%",
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "4px",
                              background: "linear-gradient(90deg, var(--mui-palette-secondary-main), var(--mui-palette-primary-main) 40%)",
                              transform: "scaleX(0)",
                              transformOrigin: "left",
                              transition: "transform 0.3s ease",
                              zIndex: 2,
                            },
                            "&:hover::before": {
                              transform: "scaleX(1)",
                            },
                          }}
                        >
                          <Link
                            href={`/publications/${pb.slug}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 3,
                            }}
                          />
                          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                            <Box
                              sx={{
                                fontSize: "0.9rem",
                                lineHeight: 1.6,
                                color: "text.primary",
                                position: "relative",
                                zIndex: 2,
                                "& a": {
                                  color: "primary.main",
                                  textDecoration: "none",
                                  "&:hover": { textDecoration: "underline" },
                                },
                              }}
                              dangerouslySetInnerHTML={{ __html: citation.html }}
                            />

                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                                pt: 1,
                                borderTop: "1px solid",
                                borderColor: "divider",
                                position: "relative",
                                zIndex: 4,
                              }}
                            >
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
                                <Chip
                                  label={pb.type}
                                  size="small"
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.625rem",
                                    height: 18,
                                    borderRadius: 1,
                                    textTransform: "uppercase",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "action.hover",
                                    color: "text.secondary",
                                  }}
                                  data-component-semantics="Metadata badge"
                                />
                                {pb.ranking && (
                                  <Chip
                                    label={`Ranking: ${pb.ranking}`}
                                    size="small"
                                    sx={{
                                      fontWeight: "bold",
                                      fontSize: "0.625rem",
                                      height: 18,
                                      borderRadius: 1,
                                      textTransform: "uppercase",
                                      border: "1px solid",
                                      borderColor: "divider",
                                      bgcolor: "action.hover",
                                      color: "text.secondary",
                                    }}
                                    data-component-semantics="Metadata badge"
                                  />
                                )}
                                {pb.tags.map((tag: string) => (
                                  <Link key={tag} href={`/tags/${tag}`} style={{ textDecoration: "none" }}>
                                    <Chip
                                      label={`#${tag}`}
                                      size="small"
                                      sx={{
                                        fontSize: "0.625rem",
                                        height: 18,
                                        borderRadius: 1,
                                        border: "1px solid",
                                        borderColor: "primary.light",
                                        bgcolor: "primary.light",
                                        color: "primary.main",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        "&:hover": {
                                          bgcolor: "primary.main",
                                          color: "common.white",
                                        },
                                      }}
                                      data-component-semantics="Tag badge"
                                    />
                                  </Link>
                                ))}
                              </Box>

                              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
                                {pb.selfArchivingUrl && (
                                  <Button
                                    component="a"
                                    href={pb.selfArchivingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="small"
                                    sx={{
                                      fontSize: "0.625rem",
                                      fontWeight: 750,
                                      py: 0.25,
                                      px: 1,
                                      height: 24,
                                      borderRadius: 1.5,
                                      position: "relative",
                                      zIndex: 4,
                                    }}
                                  >
                                    PDF
                                  </Button>
                                )}

                                {bibDownloadUrl && (
                                  <Button
                                    component="a"
                                    href={bibDownloadUrl}
                                    download={`${pb.slug || "citation"}.bib`}
                                    size="small"
                                    color="inherit"
                                    sx={{
                                      fontSize: "0.625rem",
                                      fontWeight: 750,
                                      py: 0.25,
                                      px: 1,
                                      height: 24,
                                      borderRadius: 1.5,
                                      color: "text.secondary",
                                      borderColor: "divider",
                                      border: "1px solid",
                                      "&:hover": { bgcolor: "action.hover", borderColor: "text.primary" },
                                      position: "relative",
                                      zIndex: 4,
                                    }}
                                  >
                                    BibTeX
                                  </Button>
                                )}

                                <Box sx={{ position: "relative", zIndex: 4 }}>
                                  <CopyCitationButton textToCopy={citation.text} />
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      );
                    }

                    default:
                      return null;
                  }
                };

                return (
                  <Grid size={{ xs: 12 }} key={`${item.type}-${item.id}`}>
                    {renderCard()}
                  </Grid>
                );
              })}
            </Grid>

            {/* Pagination Widget */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              currentSearchParams={{ q, type: typeFilter, limit }}
              baseUrl="/search"
            />
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
