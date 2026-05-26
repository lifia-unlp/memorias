import React from "react";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import { LinkButton } from "@/components/reusable/LinkComponents";
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
} from "@mui/material";

type SearchParams = Promise<{ q?: string; type?: string; page?: string; limit?: string }>;

interface SearchResultItem {
  id: string;
  type: "member" | "project" | "thesis" | "scholarship" | "publication";
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  updatedAt: Date;
  tags: string[];
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
    prisma.project.findMany(),
    prisma.thesis.findMany(),
    prisma.scholarship.findMany(),
    prisma.publication.findMany(),
  ]);

  const lowerQ = q.trim().toLowerCase();

  // Search filter implementation
  const matchedMembers = lowerQ
    ? members.filter(
        (m) =>
          m.firstName.toLowerCase().includes(lowerQ) ||
          m.lastName.toLowerCase().includes(lowerQ) ||
          (m.positionAtLab && m.positionAtLab.toLowerCase().includes(lowerQ)) ||
          (m.positionAtUnlp && m.positionAtUnlp.toLowerCase().includes(lowerQ)) ||
          (m.category && m.category.toLowerCase().includes(lowerQ)) ||
          (m.shortCvInSpanish && m.shortCvInSpanish.toLowerCase().includes(lowerQ)) ||
          (m.shortCvInEnglish && m.shortCvInEnglish.toLowerCase().includes(lowerQ)) ||
          m.tags.some((t) => t.toLowerCase().includes(lowerQ))
      )
    : members;

  const matchedProjects = lowerQ
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQ) ||
          (p.code && p.code.toLowerCase().includes(lowerQ)) ||
          (p.director && p.director.toLowerCase().includes(lowerQ)) ||
          (p.coDirector && p.coDirector.toLowerCase().includes(lowerQ)) ||
          (p.summary && p.summary.toLowerCase().includes(lowerQ)) ||
          (p.fundingAgency && p.fundingAgency.toLowerCase().includes(lowerQ)) ||
          p.tags.some((t) => t.toLowerCase().includes(lowerQ))
      )
    : projects;

  const matchedTheses = lowerQ
    ? theses.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQ) ||
          (t.student && t.student.toLowerCase().includes(lowerQ)) ||
          (t.director && t.director.toLowerCase().includes(lowerQ)) ||
          (t.coDirector && t.coDirector.toLowerCase().includes(lowerQ)) ||
          (t.summary && t.summary.toLowerCase().includes(lowerQ)) ||
          (t.career && t.career.toLowerCase().includes(lowerQ)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lowerQ))
      )
    : theses;

  const matchedScholarships = lowerQ
    ? scholarships.filter(
        (s) =>
          s.title.toLowerCase().includes(lowerQ) ||
          (s.student && s.student.toLowerCase().includes(lowerQ)) ||
          (s.director && s.director.toLowerCase().includes(lowerQ)) ||
          (s.coDirector && s.coDirector.toLowerCase().includes(lowerQ)) ||
          (s.summary && s.summary.toLowerCase().includes(lowerQ)) ||
          (s.type && s.type.toLowerCase().includes(lowerQ)) ||
          s.tags.some((tag) => tag.toLowerCase().includes(lowerQ))
      )
    : scholarships;

  const matchedPublications = lowerQ
    ? publications.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQ) ||
          p.authors.toLowerCase().includes(lowerQ) ||
          (p.ranking && p.ranking.toLowerCase().includes(lowerQ)) ||
          p.tags.some((tag) => tag.toLowerCase().includes(lowerQ))
      )
    : publications;

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
    title: `${m.firstName} ${m.lastName}`,
    subtitle: m.positionAtLab || m.positionAtUnlp || "Researcher",
    description: m.shortCvInSpanish || m.shortCvInEnglish || m.notes || "",
    slug: m.slug,
    updatedAt: m.updatedAt,
    tags: m.tags,
  }));

  const mappedProjects: SearchResultItem[] = matchedProjects.map((p) => ({
    id: p.id,
    type: "project",
    title: p.title,
    subtitle: p.code ? `Project Code: ${p.code}` : "Research Project",
    description: p.summary || "",
    slug: p.slug,
    updatedAt: p.updatedAt,
    tags: p.tags,
  }));

  const mappedTheses: SearchResultItem[] = matchedTheses.map((t) => ({
    id: t.id,
    type: "thesis",
    title: t.title,
    subtitle: t.student ? `Thesis by ${t.student}` : "Thesis",
    description: t.summary || "",
    slug: t.slug,
    updatedAt: t.updatedAt,
    tags: t.tags,
  }));

  const mappedScholarships: SearchResultItem[] = matchedScholarships.map((s) => ({
    id: s.id,
    type: "scholarship",
    title: s.title,
    subtitle: s.student ? `Scholarship for ${s.student}` : "Scholarship",
    description: s.summary || "",
    slug: s.slug,
    updatedAt: s.updatedAt,
    tags: s.tags,
  }));

  const mappedPublications: SearchResultItem[] = matchedPublications.map((p) => ({
    id: p.id,
    type: "publication",
    title: p.title,
    subtitle: p.authors,
    description: `${p.type.toUpperCase()}${p.year ? ` - ${p.year}` : ""}`,
    slug: p.slug,
    updatedAt: p.updatedAt,
    tags: p.tags,
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

  // Define badge metadata (color, label, details link, icon/prefix)
  const getBadgeMeta = (type: string) => {
    switch (type) {
      case "member":
        return {
          label: "Researcher",
          bg: "primary.light",
          color: "primary.main",
          link: "/members",
          border: "rgba(9, 58, 84, 0.15)",
        };
      case "project":
        return {
          label: "Project",
          bg: "success.light",
          color: "success.main",
          link: "/projects",
          border: "rgba(46, 125, 50, 0.15)",
        };
      case "thesis":
        return {
          label: "Thesis",
          bg: "info.light",
          color: "info.main",
          link: "/theses",
          border: "rgba(2, 136, 209, 0.15)",
        };
      case "scholarship":
        return {
          label: "Scholarship",
          bg: "warning.light",
          color: "warning.main",
          link: "/scholarships",
          border: "rgba(229, 98, 38, 0.15)",
        };
      case "publication":
        return {
          label: "Publication",
          bg: "error.light",
          color: "error.main",
          link: "/publications",
          border: "rgba(211, 47, 47, 0.15)",
        };
      default:
        return {
          label: "Object",
          bg: "action.hover",
          color: "text.secondary",
          link: "/",
          border: "divider",
        };
    }
  };

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
                const meta = getBadgeMeta(item.type);
                const updatedStr = new Date(item.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <Grid size={{ xs: 12 }} key={`${item.type}-${item.id}`}>
                    <Card
                      data-component-semantics="Search result card"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 3,
                        position: "relative",
                        overflow: "hidden",
                        borderLeft: "5px solid",
                        borderLeftColor: meta.color,
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background: `linear-gradient(90deg, ${meta.bg} 0%, transparent 20%)`,
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                          pointerEvents: "none",
                          zIndex: 1,
                        },
                        "&:hover::before": {
                          opacity: 0.05,
                        },
                        "&:hover .search-result-title": {
                          color: "primary.main",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {/* Full-card link navigation */}
                      <Link
                        href={`/${item.type}s/${item.slug}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 2,
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-between",
                          alignItems: { xs: "flex-start", sm: "center" },
                          gap: 1.5,
                          mb: 1.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Chip
                            label={meta.label}
                            size="small"
                            sx={{
                              bgcolor: meta.bg,
                              color: meta.color,
                              fontWeight: "bold",
                              fontSize: "0.65rem",
                              height: 20,
                              borderRadius: 1.25,
                              border: "1px solid",
                              borderColor: meta.border,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: "text.disabled", fontWeight: "bold" }}
                          >
                            Last updated: {updatedStr}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: "1.15rem",
                          fontWeight: "bold",
                          mb: 0.75,
                        }}
                      >
                        <Box
                          component="span"
                          className="search-result-title"
                          sx={{
                            color: "text.primary",
                            transition: "color 0.2s",
                          }}
                        >
                          {item.title}
                        </Box>
                      </Typography>

                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "secondary.main",
                          fontWeight: "bold",
                          mb: 2,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {item.subtitle}
                      </Typography>

                      {item.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2.5,
                            lineHeight: 1.6,
                            fontSize: "0.825rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.description}
                        </Typography>
                      )}

                      {/* Associated Tags */}
                      {item.tags.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.75,
                            mt: "auto",
                            position: "relative",
                            zIndex: 3, // Keep interactive above card overlay link
                          }}
                        >
                          {item.tags.slice(0, 5).map((tag) => (
                            <Chip
                              key={tag}
                              label={`#${tag}`}
                              size="small"
                              component={Link}
                              href={`/tags/${tag}`}
                              clickable
                              sx={{
                                fontSize: "0.625rem",
                                height: 18,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "primary.light",
                                bgcolor: "primary.light",
                                color: "primary.main",
                                fontWeight: "bold",
                                "&:hover": {
                                  bgcolor: "primary.main",
                                  color: "common.white",
                                },
                              }}
                              data-component-semantics="Tag badge"
                            />
                          ))}
                          {item.tags.length > 5 && (
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
                              +{item.tags.length - 5} more
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Card>
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
