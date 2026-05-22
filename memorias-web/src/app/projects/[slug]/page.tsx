import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RelatedTheses } from "@/components/reusable/RelatedTheses";
import { RelatedPublications } from "@/components/reusable/RelatedPublications";
import {
  Container,
  Box,
  Typography,
  Card,
  Avatar,
  Chip,
  Button,
  Grid,
} from "@mui/material";

type Params = Promise<{ slug: string }>;

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Query project and all its deep relationships
  const project = await prisma.project.findUnique({
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
      theses: {
        select: {
          id: true,
          title: true,
          slug: true,
          student: true,
          level: true,
          progress: true,
        },
      },
      scholarships: {
        select: {
          id: true,
          title: true,
          slug: true,
          student: true,
          type: true,
        },
      },
      publications: {
        orderBy: {
          year: "desc",
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const startStr = project.startDate
    ? new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "N/D";
  const endStr = project.endDate
    ? new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Ongoing";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Unified Navigation Header */}
      <Header activeTab="projects" />

      {/* Title Banner (Gradient aligned with Members page) */}
      <Box
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

        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box sx={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {project.code && (
              <Chip
                label={`Code: ${project.code}`}
                size="small"
                sx={{
                  color: "common.white",
                  borderColor: "rgba(255,255,255,0.4)",
                  border: "1px solid",
                  bgcolor: "rgba(255,255,255,0.15)",
                  alignSelf: "flex-start",
                  fontWeight: "bold",
                  fontSize: "0.7rem",
                }}
              />
            )}
            <Typography variant="h1" sx={{ color: "common.white", fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" } }}>
              {project.title}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: "bold" }}>
              Duration: {startStr} - {endStr}
            </Typography>
          </Box>

          {isEditorOrAdmin && (
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <LinkButton 
                href={`/projects/${project.slug}/edit`}
                variant="contained"
                sx={{
                  bgcolor: "common.white",
                  color: "primary.main",
                  fontWeight: "bold",
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                Edit Project
              </LinkButton>
              <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
            </Box>
          )}
        </Container>
      </Box>

      {/* Main content split grid */}
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 4,
        }}
      >
        {/* Left Column: Abstract Summary & Relations */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          
          {/* Abstract summary */}
          <Card sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography variant="h3" sx={{ color: "primary.main", fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1.5 }}>
              Project Abstract
            </Typography>
            {project.summary ? (
              <Typography variant="body1" sx={{ color: "text.primary", whiteSpace: "pre-line" }}>
                {project.summary}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", py: 2, textAlign: "center" }}>
                No description or abstract summary has been set for this project.
              </Typography>
            )}
          </Card>

          {/* Linked Theses */}
          {project.theses.length > 0 && <RelatedTheses theses={project.theses} />}

          {/* Linked Scholarships */}
          {project.scholarships.length > 0 && (
            <Box data-component-semantics="Relevant scholarships" sx={{ width: "100%" }}>
              <Typography
                variant="h3"
                sx={{
                  mb: 2.5,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 1,
                }}
              >
                Relevant scholarships
              </Typography>
              <Grid container spacing={2}>
                {project.scholarships.map((sch) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={sch.id}>
                    <Link
                      href={`/scholarships/${sch.slug}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.875rem",
                              color: "text.primary",
                              lineHeight: 1.4,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {sch.title}
                          </Typography>
                          {sch.type && (
                            <Chip
                              label={sch.type}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.625rem",
                                height: 20,
                                borderRadius: 1,
                              }}
                            />
                          )}
                        </Box>
                        {sch.student && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                            Student: {sch.student}
                          </Typography>
                        )}
                      </Box>
                      </Card>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Linked Publications */}
          {project.publications.length > 0 && <RelatedPublications publications={project.publications} />}
        </Box>

        {/* Right Column: Metadata Detail Info Sidebar */}
        <Box sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          
          <Card sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3.5 }}>
            <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "primary.main", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
              Project Details
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {project.director && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", display: "block" }}>
                    Director
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary", fontSize: "0.9rem" }}>
                    {project.director}
                  </Typography>
                </Box>
              )}

              {project.coDirector && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", display: "block" }}>
                    Co-Director
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary", fontSize: "0.9rem" }}>
                    {project.coDirector}
                  </Typography>
                </Box>
              )}

              {project.fundingAgency && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", display: "block" }}>
                    Funding Agency
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                    {project.fundingAgency}
                  </Typography>
                </Box>
              )}

              {project.amount && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", display: "block" }}>
                    Funding Amount
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                    {project.amount}
                  </Typography>
                </Box>
              )}

              {project.responsibleGroup && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", display: "block" }}>
                    Responsible Group
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                    {project.responsibleGroup}
                  </Typography>
                </Box>
              )}

              {project.website && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", display: "block" }}>
                    Project Website
                  </Typography>
                  <Button
                    component="a"
                    href={project.website}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 0.5, borderRadius: 2, fontWeight: "bold", textTransform: "none" }}
                  >
                    Visit Website
                  </Button>
                </Box>
              )}
            </Box>
          </Card>

          {/* Associated Members Box */}
          <Card sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "primary.main", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
              Associated Members ({project.members.length})
            </Typography>

            {project.members.length === 0 ? (
              <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", textAlign: "center", py: 1 }}>
                No associated researchers.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {project.members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Card
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2.5,
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                          boxShadow: "none",
                          transform: "none",
                        },
                      }}
                    >
                    <Avatar
                      src={member.avatarUrl || undefined}
                      alt={`${member.firstName} ${member.lastName}`}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "primary.light",
                        color: "primary.main",
                        fontWeight: "bold",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {!member.avatarUrl && `${member.firstName[0]}${member.lastName[0]}`}
                    </Avatar>
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "0.8rem", color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.firstName} {member.lastName}
                      </Typography>
                      {member.positionAtLab && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.7rem" }}>
                          {member.positionAtLab}
                        </Typography>
                      )}
                    </Box>
                    </Card>
                  </Link>
                ))}
              </Box>
            )}
          </Card>

          {/* Tags cloud */}
          {project.tags.length > 0 && (
            <Card sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "primary.main", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
                Research Areas
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {project.tags.map((tag) => (
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
            </Card>
          )}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
