import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteScholarshipButton } from "./DeleteScholarshipButton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RelatedMembers } from "@/components/reusable/RelatedMembers";
import { RelatedProjects } from "@/components/reusable/RelatedProjects";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";

type Params = Promise<{ slug: string }>;

export default async function ScholarshipDetailPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const scholarship = await prisma.scholarship.findUnique({
    where: { slug },
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
          avatarUrl: true,
          positionAtLab: true,
        },
      },
      projects: {
        select: {
          id: true,
          title: true,
          slug: true,
          code: true,
          fundingAgency: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  if (!scholarship) {
    notFound();
  }

  const startStr = scholarship.startDate
    ? new Date(scholarship.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "N/D";
  const endStr = scholarship.endDate
    ? new Date(scholarship.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Ongoing";

  return (
    <Box sx={{ flex1: 1, display: "flex", flexDirection: "column", minHeight: "screen" }}>
      <Header activeTab="scholarships" />

      {/* Hero Header Banner */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
          color: "common.white",
          py: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Decorative Wave Background */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            pointerEvents: "none",
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
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
              {scholarship.type && (
                <Chip
                  label={`Type: ${scholarship.type}`}
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
              <Typography
                variant="h1"
                sx={{
                  color: "common.white",
                  fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
                  fontWeight: 900,
                  lineHeight: 1.25,
                  mb: 2,
                }}
              >
                {scholarship.title}
              </Typography>

              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: "bold" }}>
                Timeline: {startStr} – {endStr}
              </Typography>
            </Box>

            {isEditorOrAdmin && (
              <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0, mt: { xs: 2, md: 0 } }}>
                <Button
                  component={Link}
                  href={`/scholarships/${scholarship.slug}/edit`}
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
                  Edit Scholarship
                </Button>
                <DeleteScholarshipButton scholarshipId={scholarship.id} scholarshipTitle={scholarship.title} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content Grid */}
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Grid container spacing={4}>
          {/* Left Column: Summary and Linked Projects */}
          <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            
            {/* Summary Card */}
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
                  Scholarship Summary
                </Typography>
                {scholarship.summary ? (
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "0.925rem",
                      lineHeight: 1.7,
                      color: "text.primary",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {scholarship.summary}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", textAlign: "center", py: 3 }}
                  >
                    No description or abstract summary has been set for this scholarship.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Connected Projects */}
            {scholarship.projects.length > 0 && (
              <Box>
                <RelatedProjects projects={scholarship.projects} />
              </Box>
            )}
          </Grid>

          {/* Right Column: Metadata Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            
            {/* Scholarship Profile details */}
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
                  Scholarship Profile
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {scholarship.student && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Scholarship Holder / Student
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem", mt: 0.25 }}>
                        {scholarship.student}
                      </Typography>
                    </Box>
                  )}

                  {scholarship.fundingAgency && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Funding Institution
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.85rem", mt: 0.25 }}>
                        {scholarship.fundingAgency}
                      </Typography>
                    </Box>
                  )}

                  {scholarship.director && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Director
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem", mt: 0.25 }}>
                        {scholarship.director}
                      </Typography>
                    </Box>
                  )}

                  {scholarship.coDirector && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Co-Director
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem", mt: 0.25 }}>
                        {scholarship.coDirector}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Associated Members/Participants */}
            {scholarship.members.length > 0 && (
              <Box>
                <RelatedMembers members={scholarship.members} title="Associated Members" />
              </Box>
            )}

            {/* Scientific Keywords / tags */}
            {scholarship.tags.length > 0 && (
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
                    Research Areas
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {scholarship.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          bgcolor: "action.selected",
                        }}
                      />
                    ))}
                  </Box>
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
