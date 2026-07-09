import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { auth } from "@/auth";
import { thesisService } from "@/lib/services/thesisService";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteThesisButton } from "./DeleteThesisButton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RelatedMembers } from "@/components/reusable/RelatedMembers";
import { RelatedProjects } from "@/components/reusable/RelatedProjects";
import { RelatedScholarships } from "@/components/reusable/RelatedScholarships";
import { RelatedPublications } from "@/components/reusable/RelatedPublications";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from "@mui/material";

type Params = Promise<{ slug: string }>;

export default async function ThesisDetailPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Query thesis and related entities using thesisService
  const thesis = await thesisService.getThesisDetail(slug);

  if (!thesis) {
    notFound();
  }

  const startStr = thesis.startDate
    ? new Date(thesis.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "N/D";
  const endStr = thesis.endDate
    ? new Date(thesis.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : thesis.progress === 100
    ? "Completed"
    : "Ongoing";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header activeTab="theses" />

      {/* Hero Header Banner */}
      <Box data-component-semantics="Hero banner"
        sx={{
          background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
          color: "common.white",
          py: 8,
          px: 3,
          boxShadow: "inset 0px -4px 10px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Decorative Wave Background */}
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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box sx={{ spaceY: 2, maxWidth: 800 }}>
              {thesis.level && (
                <Chip
                  label={`Level: ${thesis.level}`}
                  size="small"
                  sx={{
                    fontSize: "0.675rem",
                    fontWeight: "extrabold",
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    color: "common.white",
                    textTransform: "uppercase",
                    mb: 2,
                  }}
                />
              )}
              <Typography data-component-semantics="Hero title"
                variant="h1"
                sx={{
                  color: "common.white",
                  fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
                  fontWeight: 900,
                  lineHeight: 1.25,
                  mb: 2,
                }}
              >
                {thesis.title}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, fontSize: "0.85rem", fontWeight: 600 }}>
                <Typography data-component-semantics="Hero subtitle" variant="body2" sx={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: "bold" }}>
                  Timeline: {startStr} – {endStr}
                </Typography>
                {thesis.progress !== null && (
                  <>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
                      •
                    </Typography>
                    <Chip
                      label={`${thesis.progress}% Progress`}
                      size="small"
                      sx={{
                        fontSize: "0.625rem",
                        fontWeight: "extrabold",
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "common.white",
                        height: 20,
                      }}
                    />
                  </>
                )}
              </Box>
            </Box>

            {isEditorOrAdmin && (
              <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0, mt: { xs: 2, md: 0 } }}>
                <LinkButton 
                  href={`/theses/${thesis.slug}/edit`}
                  variant="contained"
                  sx={{
                    bgcolor: "common.white",
                    color: "primary.main",
                    fontWeight: "bold",
                    borderRadius: 3,
                    boxShadow: 2,
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: 3,
                    },
                  }}
                >
                  Edit Thesis
                </LinkButton>
                <DeleteThesisButton thesisId={thesis.id} thesisTitle={thesis.title} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content Grid */}
      <Container maxWidth="xl" sx={{ py: 6, flex: 1 }}>
        <Grid container spacing={4}>
          {/* Left Column: Summary, Projects, and Publications */}
          <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            
            {/* Thesis Abstract */}
            <Card sx={{ p: 1 }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "primary.main",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 1.5,
                  }}
                >
                  Thesis Abstract
                </Typography>
                {thesis.summary ? (
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "0.925rem",
                      lineHeight: 1.7,
                      color: "text.primary",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {thesis.summary}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", textAlign: "center", py: 3 }}
                  >
                    No description or abstract summary has been set for this thesis.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Connected Projects */}
            {thesis.projects.length > 0 && (
              <Box>
                <RelatedProjects projects={thesis.projects} />
              </Box>
            )}

            {/* Connected Publications */}
            {thesis.publications.length > 0 && (
              <Box>
                <RelatedPublications publications={thesis.publications} />
              </Box>
            )}
          </Grid>

          {/* Right Column: Metadata Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            
            {/* Thesis Profile details */}
            <Card sx={{ p: 1 }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: "extrabold",
                    color: "primary.main",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 1.5,
                    mb: -1,
                  }}
                >
                  Thesis Profile
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {thesis.student && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Student
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem", mt: 0.25 }}>
                        {thesis.student}
                      </Typography>
                    </Box>
                  )}

                  {thesis.career && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Career / Program
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.85rem", mt: 0.25 }}>
                        {thesis.career}
                      </Typography>
                    </Box>
                  )}

                  {thesis.director && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Director
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem", mt: 0.25 }}>
                        {thesis.director}
                      </Typography>
                    </Box>
                  )}

                  {thesis.coDirector && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Co-Director
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem", mt: 0.25 }}>
                        {thesis.coDirector}
                      </Typography>
                    </Box>
                  )}

                  {thesis.otherAdvisors && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Thesis Committee Advisors
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary", mt: 0.25 }}>
                        {thesis.otherAdvisors}
                      </Typography>
                    </Box>
                  )}

                  {thesis.progress !== null && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Thesis Completion Milestone
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={thesis.progress}
                            color="secondary"
                            sx={{ height: 6, borderRadius: 2 }}
                          />
                        </Box>
                        <Chip
                          label={`${thesis.progress}%`}
                          size="small"
                          sx={{
                            fontSize: "0.625rem",
                            fontWeight: "bold",
                            bgcolor: "action.hover",
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {thesis.reportUrl && (
                    <Button
                      component="a"
                      href={thesis.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ borderRadius: 3, fontWeight: "bold", py: 1, mt: 1 }}
                    >
                      Download Thesis Manuscript
                    </Button>
                  )}

                  {thesis.website && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Thesis Web Link
                      </Typography>
                      <Button
                        component="a"
                        href={thesis.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="text"
                        color="primary"
                        sx={{
                          p: 0,
                          mt: 0.25,
                          fontSize: "0.825rem",
                          fontWeight: "bold",
                          textTransform: "none",
                          justifyContent: "flex-start",
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                          display: "block",
                          textAlign: "left",
                        }}
                      >
                        Visit Website
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Associated Members/Participants */}
            {thesis.members.length > 0 && (
              <Box>
                <RelatedMembers members={thesis.members} />
              </Box>
            )}

            {/* Related Scholarships */}
            {thesis.scholarships.length > 0 && (
              <RelatedScholarships scholarships={thesis.scholarships} layout="list" />
            )}

            {/* Keywords & Tags cloud */}
            {(thesis.tags.length > 0 || thesis.keywords) && (
              <Card sx={{ p: 1 }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: "extrabold",
                      color: "primary.main",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      pb: 1.5,
                      mb: -0.5,
                    }}
                  >
                    Scientific Keywords
                  </Typography>

                  {thesis.keywords && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                        Keywords:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.25, color: "text.primary" }}>
                        {thesis.keywords}
                      </Typography>
                    </Box>
                  )}

                  {thesis.tags.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pt: thesis.keywords ? 1 : 0 }}>
                      {thesis.tags.map((tag) => (
                        <Chip
                          key={tag}
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
                          }}
                          data-component-semantics="Tag badge"
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
