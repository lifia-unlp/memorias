import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { jsonToBibtex } from "@/lib/bibtex";
import { CopyBibtexButton } from "./CopyBibtexButton";
import { DeletePublicationButton } from "./DeletePublicationButton";
import { formatCitation } from "@/lib/citations";
import { CopyCitationButton } from "../CopyCitationButton";
import { CitationStyleSelector } from "../CitationStyleSelector";
import { RelatedMembers } from "@/components/reusable/RelatedMembers";
import { RelatedProjects } from "@/components/reusable/RelatedProjects";
import { RelatedTheses } from "@/components/reusable/RelatedTheses";
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
type SearchParams = Promise<{ style?: string }>;

export default async function PublicationDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const resolvedSearchParams = await searchParams;
  const styleFilter = resolvedSearchParams.style || "apa";

  // Query publication and related entities with all fields needed for widgets
  const pb = await prisma.publication.findUnique({
    where: { slug },
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
          positionAtLab: true,
          avatarUrl: true,
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
    },
  });

  if (!pb) {
    notFound();
  }

  const citation = formatCitation(pb, styleFilter);
  const bibString = jsonToBibtex(pb);

  const bib = pb.bibtexData as any;
  const abstractVal = bib?.entryTags?.abstract || bib?.abstract || "";
  const doiVal = bib?.entryTags?.doi || bib?.entryTags?.DOI || "";

  return (
    <Box sx={{ flex1: 1, display: "flex", flexDirection: "column", minHeight: "screen" }}>
      <Header activeTab="publications" />

      {/* Hero Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
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
              <Chip
                label={pb.type}
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
              <Typography
                variant="h1"
                sx={{
                  color: "common.white",
                  fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.55rem" },
                  fontWeight: 900,
                  lineHeight: 1.25,
                }}
              >
                {pb.title}
              </Typography>
            </Box>

            {isEditorOrAdmin && (
              <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0, mt: { xs: 2, md: 0 } }}>
                <LinkButton 
                  href={`/publications/${pb.slug}/edit`}
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
                  Edit Publication
                </LinkButton>
                <DeletePublicationButton id={pb.id} title={pb.title} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content Grid */}
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Grid container spacing={4}>
          {/* Left Column: Reference, Abstract, BibTeX Source Code */}
          <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            
            {/* Citation Box Card */}
            <Card sx={{ p: 1 }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 1.5,
                  }}
                >
                  <Typography variant="h3" sx={{ fontSize: "0.75rem", fontWeight: "extrabold", color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}>
                    Bibliography Reference
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CitationStyleSelector initialStyle={styleFilter} />
                    <CopyCitationButton textToCopy={citation.text} />
                  </Box>
                </Box>
                <Box
                  sx={{
                    fontSize: "1.05rem",
                    lineHeight: 1.6,
                    color: "text.primary",
                    fontWeight: 500,
                    "& a": {
                      color: "primary.main",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: citation.html }}
                />
              </CardContent>
            </Card>

            {/* Publication Abstract */}
            {abstractVal && (
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
                    Publication Abstract
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "0.925rem",
                      lineHeight: 1.7,
                      color: "text.primary",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {abstractVal}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* BibTeX Source Entry */}
            {bibString && (
              <Card sx={{ overflow: "hidden" }}>
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    bgcolor: "action.hover",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h3" sx={{ fontSize: "0.75rem", fontWeight: "extrabold", color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}>
                    BibTeX Source Entry
                  </Typography>
                  <CopyBibtexButton bibtex={bibString} />
                </Box>
                <Box
                  component="pre"
                  sx={{
                    p: 3,
                    m: 0,
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    bgcolor: "common.black",
                    color: "#e2e8f0",
                    overflowX: "auto",
                    whitespace: "pre",
                    lineHeight: 1.6,
                  }}
                >
                  {bibString}
                </Box>
              </Card>
            )}

            {/* Quick Open manuscript Card */}
            {pb.selfArchivingUrl && (
              <Card sx={{ p: 1 }}>
                <CardContent sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
                      Self-Archived Version
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Read or download the open-access publication manuscript directly.
                    </Typography>
                  </Box>
                  <Button
                    component="a"
                    href={pb.selfArchivingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 3, fontWeight: "bold" }}
                  >
                    Open Manuscript PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column: Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            
            {/* Publication Profile Details */}
            <Card sx={{ p: 1 }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
                  Publication Details
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider", pb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                      Publication Year
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                      {pb.year}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", justifySpaceBetween: "space-between", borderBottom: "1px solid", borderColor: "divider", pb: 1.5, justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                      Type
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase" }}>
                      {pb.type}
                    </Typography>
                  </Box>

                  {doiVal && (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider", pb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        DOI
                      </Typography>
                      <Button
                        component="a"
                        href={`https://doi.org/${encodeURIComponent(doiVal)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="text"
                        color="primary"
                        sx={{
                          p: 0,
                          fontSize: "0.825rem",
                          fontWeight: "bold",
                          textTransform: "none",
                          minWidth: 0,
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={doiVal}
                      >
                        {doiVal}
                      </Button>
                    </Box>
                  )}

                  {pb.ranking && (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider", pb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Ranking / Tier
                      </Typography>
                      <Chip
                        label={pb.ranking}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "0.625rem",
                          height: 20,
                          bgcolor: "warning.light",
                          color: "warning.main",
                          border: "1px solid",
                          borderColor: "warning.main",
                        }}
                      />
                    </Box>
                  )}

                  {pb.tags && pb.tags.length > 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: "text.secondary" }}>
                        Keywords
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {pb.tags.map((tag) => (
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
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Associated Members (Co-Authors) */}
            {pb.members && pb.members.length > 0 && (
              <Box>
                <RelatedMembers members={pb.members} title="Co-Authors (Members)" />
              </Box>
            )}

            {/* Connected Projects */}
            {pb.projects && pb.projects.length > 0 && (
              <Box>
                <RelatedProjects projects={pb.projects} />
              </Box>
            )}

            {/* Related Theses */}
            {pb.theses && pb.theses.length > 0 && (
              <Box>
                <RelatedTheses theses={pb.theses} />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
