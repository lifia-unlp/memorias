import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { jsonToBibtex } from "@/lib/bibtex";
import { formatCitation } from "@/lib/citations";
import { CopyCitationButton } from "./CopyCitationButton";
import { Pagination } from "@/components/Pagination";
import { PublicationFilters } from "./PublicationFilters";
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

type Params = Promise<{}>;
type SearchParams = Promise<{ q?: string; type?: string; year?: string; style?: string; limit?: string; page?: string }>;

export default async function PublicationsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedSearchParams = await props.searchParams;
  const q = resolvedSearchParams.q || "";
  const typeFilter = resolvedSearchParams.type || "all";
  const yearFilter = resolvedSearchParams.year || "all";
  const styleFilter = resolvedSearchParams.style || "apa";
  const page = parseInt(resolvedSearchParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedSearchParams.limit || "10", 10) || 10;

  // Fetch unique years for filters
  const distinctYears = await prisma.publication.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  const years = distinctYears.map((d) => d.year);

  // Fetch publications based on filters
  const publications = await prisma.publication.findMany({
    where: {
      AND: [
        typeFilter !== "all" ? { type: { equals: typeFilter } } : {},
        yearFilter !== "all" ? { year: { equals: parseInt(yearFilter, 10) } } : {},
      ],
    },
    orderBy: [{ year: "desc" }, { title: "asc" }],
  });

  // Filter in memory for keyword search
  const lowerQ = q.trim().toLowerCase();
  const filteredPublications = lowerQ
    ? publications.filter((p) => {
        const matchTitle = p.title.toLowerCase().includes(lowerQ);
        const matchAuthors = p.authors.toLowerCase().includes(lowerQ);
        const matchTags = p.tags.some((tag) =>
          tag.toLowerCase().includes(lowerQ)
        );
        return matchTitle || matchAuthors || matchTags;
      })
    : publications;

  // Paginate final list
  const totalPages = Math.ceil(filteredPublications.length / limit);
  const paginatedPublications = filteredPublications.slice((page - 1) * limit, page * limit);

  return (
    <Box sx={{ flex1: 1, display: "flex", flexDirection: "column", minHeight: "screen" }}>
      <Header activeTab="publications" />

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
                Research Bibliography
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
                Browse scientific publications, books, doctoral dissertations, and conference proceedings compiled by our members.
              </Typography>
            </Box>

            {isEditorOrAdmin && (
              <LinkButton 
                href="/publications/new"
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
                Add Publication
              </LinkButton>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Layout Container */}
      <Container maxWidth="lg" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>

        {/* Filters and Grid Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <PublicationFilters years={years} />

          {filteredPublications.length === 0 ? (
            <Card
              sx={{
                textAlign: "center",
                py: 8,
                px: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="h3">No publications found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or clearing filter fields.
              </Typography>
            </Card>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Grid container spacing={2.5}>
                {paginatedPublications.map((pb) => {
                  const citation = formatCitation(pb, styleFilter);
                  const bibString = jsonToBibtex(pb);
                  const bibDownloadUrl = bibString
                    ? `data:text/plain;charset=utf-8,${encodeURIComponent(bibString)}`
                    : null;

                  return (
                    <Grid size={{ xs: 12 }} key={pb.id}>
                      <Card sx={{ width: "100%" }}>
                        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 }, display: "flex", flexDirection: "column", gap: 2 }}>
                          {/* Dynamic HTML Citation */}
                          <Box
                            sx={{
                              fontSize: "0.9rem",
                              lineHeight: 1.6,
                              color: "text.primary",
                              "& a": {
                                color: "primary.main",
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                              },
                            }}
                            dangerouslySetInnerHTML={{ __html: citation.html }}
                          />

                          {/* Metadata Indicators & Action Row */}
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
                            }}
                          >
                            {/* Chips for Type, Ranking, Tags */}
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
                              <Chip
                                label={pb.type}
                                size="small"
                                color="primary"
                                sx={{
                                  fontWeight: "bold",
                                  fontSize: "0.625rem",
                                  height: 18,
                                  borderRadius: 1,
                                  textTransform: "uppercase",
                                  bgcolor: "primary.light",
                                  color: "primary.main",
                                }}
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
                                    bgcolor: "warning.light",
                                    color: "warning.main",
                                    border: "1px solid",
                                    borderColor: "warning.main",
                                  }}
                                />
                              )}
                              {pb.tags.map((tag) => (
                                <Chip
                                  key={tag}
                                  label={`#${tag}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: "0.625rem",
                                    height: 18,
                                    borderRadius: 1,
                                    color: "text.secondary",
                                    borderColor: "divider",
                                  }}
                                />
                              ))}
                            </Box>

                            {/* Action Buttons */}
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
                                  }}
                                >
                                  BibTeX
                                </Button>
                              )}

                              <LinkButton 
                                href={`/publications/${pb.slug}`}
                                size="small"
                                color="secondary"
                                sx={{
                                  fontSize: "0.625rem",
                                  fontWeight: 750,
                                  py: 0.25,
                                  px: 1,
                                  height: 24,
                                  borderRadius: 1.5,
                                }}
                              >
                                Details
                              </LinkButton>

                              <CopyCitationButton textToCopy={citation.text} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                currentSearchParams={{ q, type: typeFilter, year: yearFilter, style: styleFilter, limit }}
                baseUrl="/publications"
              />
            </Box>
          )}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
