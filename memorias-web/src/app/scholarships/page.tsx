import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import { ScholarshipFilters } from "./ScholarshipFilters";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
} from "@mui/material";

type Params = Promise<{}>;
type SearchParams = Promise<{ q?: string; type?: string; status?: string; limit?: string; page?: string }>;

export default async function ScholarshipsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedSearchParams = await props.searchParams;
  const q = resolvedSearchParams.q || "";
  const type = resolvedSearchParams.type || "";
  const status = resolvedSearchParams.status || "";
  const page = parseInt(resolvedSearchParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedSearchParams.limit || "10", 10) || 10;

  // Dynamically build Prisma filter query
  const whereConditions: any = {
    AND: [],
  };

  if (type) {
    whereConditions.AND.push({ type });
  }

  const now = new Date();
  if (status === "completed") {
    whereConditions.AND.push({
      endDate: { lt: now },
    });
  } else if (status === "ongoing") {
    whereConditions.AND.push({
      OR: [
        { endDate: { gte: now } },
        { endDate: null },
      ],
    });
  }

  if (whereConditions.AND.length === 0) {
    delete whereConditions.AND;
  }

  // Fetch filtered scholarships
  const scholarships = await prisma.scholarship.findMany({
    where: whereConditions,
    orderBy: [
      { endDate: "desc" },
      { startDate: "desc" },
    ],
  });

  // Filter in memory for keyword search
  const lowerQ = q.trim().toLowerCase();
  const filteredScholarships = lowerQ
    ? scholarships.filter((s) => {
        const matchTitle = s.title.toLowerCase().includes(lowerQ);
        const matchStudent = !!(s.student && s.student.toLowerCase().includes(lowerQ));
        const matchAdvisors =
          !!((s.director && s.director.toLowerCase().includes(lowerQ)) ||
          (s.coDirector && s.coDirector.toLowerCase().includes(lowerQ)));
        const matchAgency = !!(s.fundingAgency && s.fundingAgency.toLowerCase().includes(lowerQ));
        const matchSummary = !!(s.summary && s.summary.toLowerCase().includes(lowerQ));
        const matchTags = s.tags.some((tag) =>
          tag.toLowerCase().includes(lowerQ)
        );
        return matchTitle || matchStudent || matchAdvisors || matchAgency || matchSummary || matchTags;
      })
    : scholarships;

  // Paginate final list
  const totalPages = Math.ceil(filteredScholarships.length / limit);
  const paginatedScholarships = filteredScholarships.slice((page - 1) * limit, page * limit);

  // Query types choices
  const typeOptions = await prisma.systemOption.findMany({
    where: { listName: "scholarshipType" },
    select: { value: true },
  });
  let types = typeOptions.map((o) => o.value);
  if (types.length === 0) {
    types = ["Doctoral", "Postdoctoral", "Training"];
  }

  return (
    <Box sx={{ flex1: 1, display: "flex", flexDirection: "column", minHeight: "screen" }}>
      <Header activeTab="scholarships" />

      {/* Unified Institutional Banner */}
      <Container maxWidth="lg" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
            color: "common.white",
            py: 6,
            px: { xs: 3, md: 6 },
            borderRadius: 4,
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.1)",
            position: "relative",
            overflow: "hidden",
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
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
            </svg>
          </Box>

          <Box sx={{ zIndex: 1, maxWidth: 600 }}>
            <Typography variant="h1" sx={{ color: "common.white", mb: 1, fontSize: { xs: "2rem", md: "2.5rem" } }}>
              Academic Scholarships
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
              Explore professional fellowships, doctoral, and training scholarships funded by scientific agencies.
            </Typography>
          </Box>

          {isEditorOrAdmin && (
            <LinkButton 
              href="/scholarships/new"
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
              Add Scholarship
            </LinkButton>
          )}
        </Box>

        {/* Filters and Grid Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <ScholarshipFilters types={types} />

          {filteredScholarships.length === 0 ? (
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
              <Typography variant="h3">No scholarships found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or clearing filter fields.
              </Typography>
            </Card>
          ) : (
            <Box>
              <Grid container spacing={3}>
                {paginatedScholarships.map((s) => {
                  const startStr = s.startDate
                    ? new Date(s.startDate).getFullYear()
                    : "N/D";
                  const isCompleted = s.endDate && new Date(s.endDate) < now;
                  const endStr = s.endDate
                    ? new Date(s.endDate).getFullYear()
                    : "Ongoing";

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={s.id}>
                      <Link
                        href={`/scholarships/${s.slug}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
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
                              background: "linear-gradient(90deg, var(--mui-palette-secondary-main), var(--mui-palette-primary-main) 40%)",
                              transform: "scaleX(0)",
                              transformOrigin: "left",
                              transition: "transform 0.3s ease",
                            },
                            "&:hover::before": {
                              transform: "scaleX(1)",
                            },
                          }}
                        >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
                          {s.type && (
                            <Chip
                              label={s.type}
                              size="small"
                              sx={{
                                fontSize: "0.625rem",
                                fontWeight: "bold",
                                bgcolor: "primary.light",
                                color: "primary.main",
                                textTransform: "uppercase",
                                tracking: 1,
                                height: 20,
                              }}
                            />
                          )}
                          <Chip
                            label={isCompleted ? "Completed" : "Ongoing"}
                            size="small"
                            sx={{
                              fontSize: "0.625rem",
                              fontWeight: "bold",
                              bgcolor: isCompleted ? "success.light" : "warning.light",
                              color: isCompleted ? "success.dark" : "warning.dark",
                              height: 20,
                            }}
                          />
                        </Box>

                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: "1.15rem",
                            fontWeight: "bold",
                            lineHeight: 1.3,
                            mb: 2,
                            color: "text.primary",
                            "&:hover": { color: "primary.main" },
                            transition: "color 0.2s",
                          }}
                        >
                          {s.title}
                        </Typography>

                        {/* Details Grid */}
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
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                              Timeline:
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.primary" }}>
                              {startStr} – {endStr}
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
                            }}
                          >
                            {s.summary}
                          </Typography>
                        )}

                        {/* Tags */}
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
                            }}
                          >
                            {s.tags.slice(0, 4).map((tag, idx) => (
                              <Chip
                                key={idx}
                                label={`#${tag}`}
                                size="small"
                                sx={{
                                  fontSize: "0.625rem",
                                  height: 20,
                                  bgcolor: "action.selected",
                                  fontWeight: 500,
                                }}
                              />
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
                      </Link>
                    </Grid>
                  );
                })}
              </Grid>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                currentSearchParams={{ q, type, status, limit }}
                baseUrl="/scholarships"
              />
            </Box>
          )}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
