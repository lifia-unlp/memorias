import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import { ThesisFilters } from "./ThesisFilters";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  LinearProgress,
} from "@mui/material";

type Params = Promise<{}>;
type SearchParams = Promise<{ q?: string; level?: string; status?: string; limit?: string; page?: string }>;

export default async function ThesesPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedSearchParams = await props.searchParams;
  const q = resolvedSearchParams.q || "";
  const level = resolvedSearchParams.level || "";
  const status = resolvedSearchParams.status || "";
  const page = parseInt(resolvedSearchParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedSearchParams.limit || "10", 10) || 10;

  // Dynamically build Prisma filter query
  const whereConditions: any = {
    AND: [],
  };

  if (level) {
    whereConditions.AND.push({ level });
  }

  if (status === "completed") {
    whereConditions.AND.push({ progress: 100 });
  } else if (status === "ongoing") {
    whereConditions.AND.push({
      OR: [
        { progress: { lt: 100 } },
        { progress: null },
      ],
    });
  }

  if (whereConditions.AND.length === 0) {
    delete whereConditions.AND;
  }

  // Fetch filtered theses
  const theses = await prisma.thesis.findMany({
    where: whereConditions,
    orderBy: [
      { endDate: "desc" },
      { startDate: "desc" },
    ],
  });

  // Filter in memory for keyword search
  const lowerQ = q.trim().toLowerCase();
  const filteredTheses = lowerQ
    ? theses.filter((t) => {
        const matchTitle = t.title.toLowerCase().includes(lowerQ);
        const matchStudent = !!(t.student && t.student.toLowerCase().includes(lowerQ));
        const matchAdvisors =
          !!((t.director && t.director.toLowerCase().includes(lowerQ)) ||
          (t.coDirector && t.coDirector.toLowerCase().includes(lowerQ)));
        const matchCareer = !!(t.career && t.career.toLowerCase().includes(lowerQ));
        const matchSummary = !!(t.summary && t.summary.toLowerCase().includes(lowerQ));
        const matchTags = t.tags.some((tag) =>
          tag.toLowerCase().includes(lowerQ)
        );
        return matchTitle || matchStudent || matchAdvisors || matchCareer || matchSummary || matchTags;
      })
    : theses;

  // Paginate final list
  const totalPages = Math.ceil(filteredTheses.length / limit);
  const paginatedTheses = filteredTheses.slice((page - 1) * limit, page * limit);

  // Query levels choices
  const levelOptions = await prisma.systemOption.findMany({
    where: { listName: "thesisLevel" },
    select: { value: true },
  });
  let levels = levelOptions.map((o) => o.value);
  if (levels.length === 0) {
    levels = ["PhD", "Masters", "Grade"];
  }

  return (
    <Box sx={{ flex1: 1, display: "flex", flexDirection: "column", minHeight: "screen" }}>
      <Header activeTab="theses" />

      {/* Unified Institutional Banner */}
      <Container maxWidth="lg" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
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
              Academic Theses
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
              Explore doctoral, master, and graduation theses developed and directed within our research laboratory.
            </Typography>
          </Box>

          {isEditorOrAdmin && (
            <Button
              component={Link}
              href="/theses/new"
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
              Add Thesis
            </Button>
          )}
        </Box>

        {/* Filters and Grid Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <ThesisFilters levels={levels} />

          {filteredTheses.length === 0 ? (
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
              <Typography variant="h3">No theses found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or clearing filter fields.
              </Typography>
            </Card>
          ) : (
            <Box>
              <Grid container spacing={3}>
                {paginatedTheses.map((ths) => {
                  const startStr = ths.startDate
                    ? new Date(ths.startDate).getFullYear()
                    : "N/D";
                  const endStr = ths.endDate
                    ? new Date(ths.endDate).getFullYear()
                    : ths.progress === 100
                    ? "Completed"
                    : "Ongoing";

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={ths.id}>
                      <Card
                        component={Link}
                        href={`/theses/${ths.slug}`}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          textDecoration: "none",
                          color: "inherit",
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
                            background: (theme) =>
                              `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main} 40%)`,
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
                          {ths.level && (
                            <Chip
                              label={ths.level}
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
                          {ths.progress !== null && (
                            <Chip
                              label={ths.progress === 100 ? "Completed" : `${ths.progress}% Progress`}
                              size="small"
                              sx={{
                                fontSize: "0.625rem",
                                fontWeight: "bold",
                                bgcolor: ths.progress === 100 ? "success.light" : "warning.light",
                                color: ths.progress === 100 ? "success.dark" : "warning.dark",
                                height: 20,
                              }}
                            />
                          )}
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
                          {ths.title}
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

                          {ths.student && (
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                Student:
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.primary" }}>
                                {ths.student}
                              </Typography>
                            </Box>
                          )}

                          {ths.director && (
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                Director:
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.primary" }}>
                                {ths.director}
                              </Typography>
                            </Box>
                          )}

                          {ths.coDirector && (
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                Co-Director:
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.primary" }}>
                                {ths.coDirector}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {ths.summary && (
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
                            {ths.summary}
                          </Typography>
                        )}

                        {/* Progress bar preview if not completed */}
                        {ths.progress !== null && ths.progress < 100 && (
                          <Box sx={{ mt: "auto", mb: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={ths.progress}
                              color="secondary"
                              sx={{ height: 4, borderRadius: 1 }}
                            />
                          </Box>
                        )}

                        {/* Tags */}
                        {ths.tags.length > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: ths.progress !== null && ths.progress < 100 ? 0 : "auto",
                              pt: 2,
                              borderTop: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            {ths.tags.slice(0, 4).map((tag, idx) => (
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
                            {ths.tags.length > 4 && (
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
                                +{ths.tags.length - 4} more
                              </Typography>
                            )}
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
                currentSearchParams={{ q, level, status, limit }}
                baseUrl="/theses"
              />
            </Box>
          )}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
