import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { publicationService } from "@/lib/services/publicationService";
import { auth } from "@/auth";
import Link from "next/link";
import { Header } from "@/components/Header";
import { matchQueryTokens } from "@/lib/search";
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

  // Fetch unique years for filters using publicationService
  const years = await publicationService.getDistinctYears();

  const whereConditions = {
    AND: [
      typeFilter !== "all" ? { type: { equals: typeFilter } } : {},
      yearFilter !== "all" ? { year: { equals: parseInt(yearFilter, 10) } } : {},
    ],
  };

  // Fetch publications based on filters using publicationService
  const publications = await publicationService.getAllPublications(whereConditions);

  // Filter in memory for keyword search
  const filteredPublications = publications.filter((p) =>
    matchQueryTokens(q, [
      p.title,
      p.authors,
      p.tags,
    ])
  );

  // Paginate final list
  const totalPages = Math.ceil(filteredPublications.length / limit);
  const paginatedPublications = filteredPublications.slice((page - 1) * limit, page * limit);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header activeTab="publications" />

      {/* Hero Banner Section */}
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
            <Box sx={{ zIndex: 1, maxWidth: 600 }}>
              <Typography data-component-semantics="Hero title" variant="h1" sx={{ color: "common.white", mb: 1, fontSize: { xs: "2rem", md: "2.5rem" } }}>
                Research Bibliography
              </Typography>
              <Typography data-component-semantics="Hero subtitle" variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
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
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>

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
                      <Card
                        data-component-semantics="Publication directory card"
                        sx={{
                          width: "100%",
                          position: "relative",
                          overflow: "hidden",
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
                        {/* Absolute overlay link for entire card click */}
                        <Link
                          href={`/publications/${pb.slug}`}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1,
                          }}
                        />
                        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 }, display: "flex", flexDirection: "column", gap: 2 }}>
                          {/* Dynamic HTML Citation */}
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
                              {pb.tags.map((tag) => (
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
                                    position: "relative",
                                    zIndex: 2,
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
                                    zIndex: 2,
                                  }}
                                >
                                  BibTeX
                                </Button>
                              )}

                              <Box sx={{ position: "relative", zIndex: 2 }}>
                                <CopyCitationButton textToCopy={citation.text} />
                              </Box>
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
