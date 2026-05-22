import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

type Params = Promise<{}>;
type SearchParams = Promise<{ q?: string; limit?: string; page?: string }>;

export default async function ProjectsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedSearchParams = await props.searchParams;
  const q = resolvedSearchParams.q || "";
  const page = parseInt(resolvedSearchParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedSearchParams.limit || "10", 10) || 10;

  // Query all projects with members
  const projects = await prisma.project.findMany({
    include: {
      members: {
        select: {
          firstName: true,
          lastName: true,
          slug: true,
        },
      },
    },
    orderBy: { endDate: "desc" },
  });

  // Filter in memory for maximum search flexibility (including partial, case-insensitive tag matching)
  const lowerQ = q.trim().toLowerCase();
  const filteredProjects = lowerQ
    ? projects.filter((p) => {
        const matchTitle = p.title.toLowerCase().includes(lowerQ);
        const matchCode = !!(p.code && p.code.toLowerCase().includes(lowerQ));
        const matchDirector =
          !!((p.director && p.director.toLowerCase().includes(lowerQ)) ||
          (p.coDirector && p.coDirector.toLowerCase().includes(lowerQ)));
        const matchSummary = !!(p.summary && p.summary.toLowerCase().includes(lowerQ));
        const matchAgency = !!(p.fundingAgency && p.fundingAgency.toLowerCase().includes(lowerQ));
        const matchTags = p.tags.some((tag) =>
          tag.toLowerCase().includes(lowerQ)
        );
        return matchTitle || matchCode || matchDirector || matchSummary || matchAgency || matchTags;
      })
    : projects;

  // Paginate final list
  const totalPages = Math.ceil(filteredProjects.length / limit);
  const paginatedProjects = filteredProjects.slice((page - 1) * limit, page * limit);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Unified Navigation Header */}
      <Header activeTab="projects" />

      {/* Hero Banner Section */}
      <Box
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
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            {/* Wave background element */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.08,
                pointerEvents: "none",
                "& svg": { width: "100%", height: "100%" },
              }}
            >
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
              </svg>
            </Box>

            <Box sx={{ zIndex: 1, maxWidth: 600 }}>
              <Typography variant="h1" sx={{ color: "common.white", mb: 1, fontSize: { xs: "2rem", md: "2.5rem" } }}>
                Research Projects
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
                Explore scientific investigations, research initiatives, and technology transfers engineered by our lab.
              </Typography>
            </Box>

            {isEditorOrAdmin && (
              <LinkButton 
                href="/projects/new"
                variant="contained"
                sx={{
                  bgcolor: "common.white",
                  color: "primary.main",
                  fontWeight: "bold",
                  borderRadius: 3,
                  boxShadow: 2,
                  px: 3,
                  py: 1.5,
                  zIndex: 1,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    boxShadow: 3,
                  },
                }}
              >
                Add Project
              </LinkButton>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Layout Container */}
      <Container maxWidth="lg" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>

        {/* Main Search and Grid Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
              <TextField
                fullWidth
                size="small"
                name="q"
                defaultValue={q}
                placeholder="Search projects by title, code, summary, funding agency..."
                variant="outlined"
              />

              <FormControl size="small" sx={{ width: { xs: "100%", md: 160 }, shrink: 0 }}>
                <Select name="limit" defaultValue={limit.toString()}>
                  <MenuItem value="10">10 per page</MenuItem>
                  <MenuItem value="20">20 per page</MenuItem>
                  <MenuItem value="30">30 per page</MenuItem>
                  <MenuItem value="100">100 per page</MenuItem>
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
                  Filter
                </Button>

                {(q || limit !== 10) && (
                  <LinkButton 
                    href="/projects"
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

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
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
              <Typography variant="h3">No Projects Found</Typography>
              <Typography variant="body2" color="text.secondary">
                We could not find any projects matching your search query. Try broadening your keywords.
              </Typography>
            </Card>
          ) : (
            <Box>
              <Grid container spacing={3}>
                {paginatedProjects.map((project) => {
                  const startStr = project.startDate
                    ? new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                    : "N/D";
                  const endStr = project.endDate
                    ? new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                    : "Ongoing";

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={project.id}>
                      <Card
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          p: 3,
                          position: "relative",
                          overflow: "hidden",
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
                          },
                          "&:hover::before": {
                            transform: "scaleX(1)",
                          },
                        }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontSize: "1.1rem",
                              fontWeight: "bold",
                              lineHeight: 1.4,
                              transition: "color 0.2s",
                            }}
                          >
                            <Link
                              href={`/projects/${project.slug}`}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  color: "text.primary",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  "&:hover": { color: "primary.main", textDecoration: "underline" },
                                }}
                              >
                                {project.title}
                              </Box>
                            </Link>
                          </Typography>
                          {project.code && (
                            <Chip
                              label={`Code: ${project.code}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.625rem",
                                height: 20,
                                borderRadius: 1,
                                mt: 1.5,
                              }}
                            />
                          )}
                        </Box>

                        {/* Dates & Directors Block */}
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

                        {/* Summary Snippet */}
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
                            }}
                          >
                            {project.summary}
                          </Typography>
                        )}

                        {/* Associated Members as links */}
                        {project.members.length > 0 && (
                          <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2, mt: "auto", mb: project.tags.length > 0 ? 2 : 0 }}>
                            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary", display: "block", mb: 0.5 }}>
                              Associated Members:
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                              {project.members.map((member, i) => (
                                <React.Fragment key={member.slug}>
                                  <Link
                                    href={`/members/${member.slug}`}
                                    style={{ textDecoration: "none" }}
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

                        {/* Tags */}
                        {project.tags.length > 0 && (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, pt: project.members.length > 0 ? 0 : 2, mt: project.members.length > 0 ? 0 : "auto" }}>
                            {project.tags.slice(0, 4).map((tag) => (
                              <Chip
                                key={tag}
                                label={`#${tag}`}
                                size="small"
                                sx={{
                                  fontSize: "0.625rem",
                                  height: 20,
                                  bgcolor: "action.hover",
                                  color: "text.secondary",
                                  fontWeight: 500,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                currentSearchParams={{ q, limit }}
                baseUrl="/projects"
              />
            </Box>
          )}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
