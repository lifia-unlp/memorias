import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { formatCitation } from "@/lib/citations";
import { getLabName } from "@/lib/config";
import { getAllTagsWithCounts } from "@/lib/tags";
import { TagCloud } from "@/components/TagCloud";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
} from "@mui/material";

export default async function Home() {
  const labName = await getLabName();

  // Query featured publications
  const featuredPublications = await prisma.publication.findMany({
    where: { featured: true },
    orderBy: { updatedAt: "desc" },
  });

  // Query featured theses
  const featuredTheses = await prisma.thesis.findMany({
    where: { featured: true },
    orderBy: { updatedAt: "desc" },
  });

  // Query featured projects
  const featuredProjects = await prisma.project.findMany({
    where: { featured: true },
    orderBy: { updatedAt: "desc" },
  });

  // Load welcome configuration
  const titleOption = await (prisma as any).systemSetting
    ?.findUnique({ where: { key: "welcome_title" } })
    .catch(() => null);
  const subtitleOption = await (prisma as any).systemSetting
    ?.findUnique({ where: { key: "welcome_subtitle" } })
    .catch(() => null);
  const welcomeTitle = titleOption?.value || "Welcome to Memorias";
  const welcomeSubtitle =
    subtitleOption?.value ||
    "A state-of-the-art research repository and laboratory management portal. Discover publications, explore active research projects, and access defended theses.";

  // Fetch tag cloud metadata
  const tags = await getAllTagsWithCounts();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Unified Navigation Header */}
      <Header />

      {/* Hero Banner Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
          color: "#ffffff",
          py: 8,
          px: 3,
          boxShadow: "inset 0px -4px 10px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Dynamic Abstract Wave SVGs */}
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
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 10 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2rem", md: "2.75rem" },
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              {welcomeTitle}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.85)",
                maxWidth: 800,
                fontSize: { xs: "0.875rem", md: "1rem" },
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {welcomeSubtitle}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content Dashboard */}
      <Container maxWidth="xl" component="main" sx={{ py: 6, flexGrow: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        
        {/* Dynamic Tag Cloud Topic Explorer */}
        <Box>
          <TagCloud tags={tags} limit={40} />
        </Box>

        {/* 1. Featured Publications (Full Width) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 2,
            }}
          >
            <Typography variant="h2" sx={{ fontSize: "1.35rem", fontWeight: 800 }}>
              Featured Publications
            </Typography>
            <LinkButton 
              href="/publications"
              size="small"
              sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
            >
              Browse All Publications →
            </LinkButton>
          </Box>

          {featuredPublications.length === 0 ? (
            <Card
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                borderStyle: "dashed",
                borderColor: "divider",
                bgcolor: "transparent",
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                No publications have been featured yet. Editors can select featured records from the publication manager.
              </Typography>
            </Card>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {featuredPublications.map((pub) => {
                const citation = formatCitation(pub, "apa");
                return (
                  <Card
                    key={pub.id}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", md: "center" },
                      p: 3,
                      gap: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1 }}>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip
                          label="Featured Publication"
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "0.625rem",
                            height: 18,
                            borderRadius: 1,
                            bgcolor: "secondary.light",
                            color: "secondary.dark",
                            border: "1px solid",
                            borderColor: "secondary.main",
                          }}
                        />
                        <Chip
                          label={`Year ${pub.year}`}
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "0.625rem",
                            height: 18,
                            borderRadius: 1,
                            bgcolor: "action.hover",
                            color: "text.secondary",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: "0.95rem",
                          fontWeight: 800,
                          lineHeight: 1.4,
                        }}
                      >
                        <Link
                          href={`/publications/${pub.slug}`}
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: "text.primary",
                              "&:hover": { color: "primary.main", textDecoration: "underline" },
                            }}
                          >
                            {pub.title}
                          </Box>
                        </Link>
                      </Typography>
                      <Box
                        sx={{
                          fontSize: "0.75rem",
                          lineHeight: 1.6,
                          color: "text.secondary",
                          "& a": {
                            color: "primary.main",
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: citation.html }}
                      />
                    </Box>
                    <LinkButton 
                      href={`/publications/${pub.slug}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: 2,
                        py: 1,
                        px: 2,
                        textTransform: "none",
                        color: "text.secondary",
                        borderColor: "divider",
                        flexShrink: 0,
                        alignSelf: { xs: "stretch", md: "center" },
                        textAlign: "center",
                        "&:hover": { borderColor: "text.primary", bgcolor: "action.hover" },
                      }}
                    >
                      View Citation Details
                    </LinkButton>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>

        {/* 2. Featured Theses and Projects (Side-by-Side Layout) */}
        <Grid container spacing={4}>
          {/* Left Column: Featured Theses */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 2,
                }}
              >
                <Typography variant="h2" sx={{ fontSize: "1.25rem", fontWeight: 800 }}>
                  Featured Theses
                </Typography>
                <LinkButton 
                  href="/theses"
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                >
                  All Theses →
                </LinkButton>
              </Box>

              {featuredTheses.length === 0 ? (
                <Card
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderStyle: "dashed",
                    borderColor: "divider",
                    bgcolor: "transparent",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    No academic theses flagged as featured yet.
                  </Typography>
                </Card>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {featuredTheses.map((thesis) => (
                    <Card
                      key={thesis.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 2.5,
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
                          {thesis.level && (
                            <Chip
                              label={thesis.level}
                              size="small"
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.625rem",
                                height: 18,
                                borderRadius: 1,
                                bgcolor: "action.hover",
                                color: "text.secondary",
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            />
                          )}
                          {thesis.progress !== null && (
                            <Chip
                              label={thesis.progress === 100 ? "Completed" : `${thesis.progress}%`}
                              size="small"
                              sx={{
                                fontWeight: "black",
                                fontSize: "0.625rem",
                                height: 18,
                                borderRadius: 1,
                                bgcolor: thesis.progress === 100 ? "success.light" : "warning.light",
                                color: thesis.progress === 100 ? "success.dark" : "warning.dark",
                                border: "1px solid",
                                borderColor: thesis.progress === 100 ? "success.main" : "warning.main",
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            lineHeight: 1.4,
                          }}
                        >
                          <Link
                            href={`/theses/${thesis.slug}`}
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
                              {thesis.title}
                            </Box>
                          </Link>
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          fontSize: "0.725rem",
                          color: "text.secondary",
                          bgcolor: "action.hover",
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          "& strong": { color: "text.primary", fontWeight: 700 },
                        }}
                      >
                        {thesis.student && (
                          <Typography variant="body2" sx={{ fontSize: "0.725rem", mb: 0.5 }}>
                            <strong>Student:</strong> {thesis.student}
                          </Typography>
                        )}
                        {thesis.director && (
                          <Typography variant="body2" sx={{ fontSize: "0.725rem" }}>
                            <strong>Director:</strong> {thesis.director}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Column: Featured Projects */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 2,
                }}
              >
                <Typography variant="h2" sx={{ fontSize: "1.25rem", fontWeight: 800 }}>
                  Featured Projects
                </Typography>
                <LinkButton 
                  href="/projects"
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                >
                  All Projects →
                </LinkButton>
              </Box>

              {featuredProjects.length === 0 ? (
                <Card
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderStyle: "dashed",
                    borderColor: "divider",
                    bgcolor: "transparent",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    No research projects flagged as featured yet.
                  </Typography>
                </Card>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {featuredProjects.map((project) => (
                    <Card
                      key={project.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 2.5,
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-start" }}>
                        {project.code && (
                          <Chip
                            label={project.code}
                            size="small"
                            sx={{
                              fontWeight: "bold",
                              fontSize: "0.625rem",
                              height: 18,
                              borderRadius: 1,
                              mb: 0.5,
                              bgcolor: "action.hover",
                              color: "text.secondary",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                        )}
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            lineHeight: 1.4,
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
                      </Box>

                      <Box
                        sx={{
                          fontSize: "0.725rem",
                          color: "text.secondary",
                          bgcolor: "action.hover",
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          "& strong": { color: "text.primary", fontWeight: 700 },
                        }}
                      >
                        {project.director && (
                          <Typography variant="body2" sx={{ fontSize: "0.725rem", mb: 0.5 }}>
                            <strong>Director:</strong> {project.director}
                          </Typography>
                        )}
                        {project.fundingAgency && (
                          <Typography variant="body2" sx={{ fontSize: "0.725rem" }}>
                            <strong>Funding:</strong> {project.fundingAgency}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Reusable Portal Footer */}
      <Footer />
    </Box>
  );
}
