import React from "react";
import { prisma } from "@/lib/prisma";
import { MemberFilters } from "./MemberFilters";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { auth } from "@/auth";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Avatar,
  Chip,
} from "@mui/material";

type SearchParams = Promise<{ query?: string; position?: string; limit?: string; page?: string }>;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";
  const position = resolvedParams.position || "";
  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedParams.limit || "10", 10) || 10;

  // Fetch distinct positions dynamically for filters
  const distinctPositions = await prisma.member.findMany({
    select: { positionAtLab: true },
    distinct: ["positionAtLab"],
  });
  const positions = distinctPositions
    .map((p) => p.positionAtLab)
    .filter(Boolean) as string[];

  // Fetch members with position filter
  const members = await prisma.member.findMany({
    where: position ? { positionAtLab: { equals: position } } : {},
    orderBy: { lastName: "asc" },
  });

  // Filter in memory for maximum search flexibility (including case-insensitive, partial array tag matching)
  const lowerQuery = query.trim().toLowerCase();
  const filteredMembers = lowerQuery
    ? members.filter((m) => {
        const matchName =
          m.firstName.toLowerCase().includes(lowerQuery) ||
          m.lastName.toLowerCase().includes(lowerQuery);
        const matchPosition =
          (m.positionAtLab && m.positionAtLab.toLowerCase().includes(lowerQuery)) ||
          (m.positionAtUnlp && m.positionAtUnlp.toLowerCase().includes(lowerQuery));
        const matchTags = m.tags.some((tag) =>
          tag.toLowerCase().includes(lowerQuery)
        );
        return matchName || matchPosition || matchTags;
      })
    : members;

  // Paginate final list
  const totalPages = Math.ceil(filteredMembers.length / limit);
  const paginatedMembers = filteredMembers.slice((page - 1) * limit, page * limit);

  return (
    <Box sx={{ flex1: 1, display: "flex", flexDirection: "column", minHeight: "screen" }}>
      {/* Unified Header */}
      <Header activeTab="members" />

      {/* Main Layout Container */}
      <Container maxWidth="lg" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        
        {/* Hero Banner Section */}
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
              Our Researchers
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
              Meet the academics, PhD scholars, and scientific collaborators conducting pioneering research at our Lab.
            </Typography>
          </Box>

          {isEditorOrAdmin && (
            <Button
              component={Link}
              href="/members/new"
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
              Add Researcher
            </Button>
          )}
        </Box>

        {/* Filters and Members Grid */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <MemberFilters positions={positions} />

          {filteredMembers.length === 0 ? (
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
              <Typography variant="h3">No researchers found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your keywords or clearing the position filters.
              </Typography>
            </Card>
          ) : (
            <Box>
              <Grid container spacing={3}>
                {paginatedMembers.map((m) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.id}>
                    <Card
                      component={Link}
                      href={`/members/${m.slug}`}
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Avatar
                          src={m.avatarUrl || undefined}
                          alt={`${m.firstName} ${m.lastName}`}
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "primary.light",
                            color: "primary.main",
                            fontWeight: "bold",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {!m.avatarUrl && `${m.firstName[0]}${m.lastName[0]}`}
                        </Avatar>
                        <Box sx={{ overflow: "hidden" }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontSize: "1.05rem",
                              fontWeight: "bold",
                              mb: 0.5,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              "&:hover": { color: "primary.main" },
                              transition: "color 0.2s",
                            }}
                          >
                            {m.firstName} {m.lastName}
                          </Typography>
                          {m.positionAtLab && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "bold",
                                color: "secondary.main",
                                textTransform: "uppercase",
                                tracking: 1,
                                display: "block",
                              }}
                            >
                              {m.positionAtLab}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Scientific Roles / Info */}
                      <Box
                        sx={{
                          fontSize: "0.75rem",
                          borderTop: "1px solid",
                          borderColor: "divider",
                          pt: 2,
                          mb: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.75,
                        }}
                      >
                        {m.highestDegree && (
                          <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
                            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                              Degree:
                            </Typography>
                            <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {m.highestDegree}
                            </Typography>
                          </Box>
                        )}
                        {m.positionAtCONICET && (
                          <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
                            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                              CONICET:
                            </Typography>
                            <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {m.positionAtCONICET}
                            </Typography>
                          </Box>
                        )}
                        {m.institutionalEmail && (
                          <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
                            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                              Email:
                            </Typography>
                            <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "primary.main" }}>
                              {m.institutionalEmail}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Tags */}
                      {m.tags.length > 0 && (
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
                          {m.tags.slice(0, 3).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={`#${tag}`}
                              size="small"
                              sx={{
                                fontSize: "0.625rem",
                                height: 20,
                                bgcolor: "action.hover",
                                fontWeight: 500,
                              }}
                            />
                          ))}
                          {m.tags.length > 3 && (
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
                              +{m.tags.length - 3} more
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                currentSearchParams={{ query, position, limit }}
                baseUrl="/members"
              />
            </Box>
          )}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
