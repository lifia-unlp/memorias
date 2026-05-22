import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { formatCitation } from "@/lib/citations";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default async function TagDetailsPage({ params }: TagPageProps) {
  const { tag: rawTag } = await params;
  const decodedTag = decodeURIComponent(rawTag).trim().toLowerCase();

  if (!decodedTag) {
    return notFound();
  }

  // Fetch all related entities sequentially
  const members = await prisma.member.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const projects = await prisma.project.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: { title: "asc" },
  });

  const theses = await prisma.thesis.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: { title: "asc" },
  });

  const scholarships = await prisma.scholarship.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: { title: "asc" },
  });

  const publications = await prisma.publication.findMany({
    where: { tags: { has: decodedTag } },
    orderBy: { year: "desc" },
  });

  const totalMatches =
    members.length +
    projects.length +
    theses.length +
    scholarships.length +
    publications.length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Header />

      <Container
        component="main"
        maxWidth="lg"
        sx={{ flex: 1, py: 5, px: { xs: 3, md: 3 }, display: "flex", flexDirection: "column", gap: 5 }}
      >
        {/* Navigation Breadcrumb & Page Header */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            component={Link}
            href="/"
            variant="text"
            size="small"
            sx={{ alignSelf: "flex-start", fontWeight: 700, fontSize: "0.75rem", px: 0 }}
          >
            Back to Home
          </Button>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: "1.875rem",
                  fontWeight: 900,
                  letterSpacing: "-0.025em",
                  color: "text.primary",
                  textTransform: "capitalize",
                }}
              >
                Topic: {decodedTag}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
              >
                Unified directory of all items matching this research classification.
              </Typography>
            </Box>

            <Chip
              label={`${totalMatches} ${totalMatches === 1 ? "Linked Entry" : "Linked Entries"}`}
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: "0.75rem", alignSelf: { xs: "flex-start", sm: "center" }, flexShrink: 0 }}
            />
          </Box>
        </Box>

        {totalMatches === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              textAlign: "center",
              py: 10,
              borderRadius: 4,
              borderStyle: "dashed",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 900, fontSize: "1.125rem", color: "text.primary" }}>
              No entries found
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", maxWidth: "24rem" }}>
              There are currently no items classified under &ldquo;{decodedTag}&rdquo; in our repository.
            </Typography>
            <Button
              component={Link}
              href="/"
              variant="contained"
              size="small"
              sx={{ fontWeight: 700, borderRadius: 2, mt: 1 }}
            >
              Return Home
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {/* 1. Associated Laboratory Members */}
            {members.length > 0 && (
              <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "0.1em" }}
                >
                  Laboratory Members ({members.length})
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
                  {members.map((member, index) => (
                    <React.Fragment key={member.id}>
                      {index > 0 && <Divider />}
                      <Box
                        component={Link}
                        href={`/members/${member.slug}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": { bgcolor: "action.hover" },
                          transition: "background-color 0.15s",
                        }}
                      >
                        {member.avatarUrl ? (
                          <Avatar
                            src={member.avatarUrl}
                            alt={`${member.firstName} avatar`}
                            sx={{ width: 40, height: 40, border: "1px solid", borderColor: "divider", flexShrink: 0 }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.08)"
                                  : "rgba(0,0,0,0.08)",
                              color: "primary.main",
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              border: "1px solid",
                              borderColor: "divider",
                              flexShrink: 0,
                            }}
                          >
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </Avatar>
                        )}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "text.primary",
                              display: "block",
                              "&:hover": { color: "primary.main" },
                            }}
                          >
                            {member.firstName} {member.lastName}
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mt: 0.75 }}>
                            <Chip
                              label={member.positionAtLab || "Lab Researcher"}
                              size="small"
                              sx={{ fontSize: "0.625rem", fontWeight: 600, height: 20 }}
                            />
                            {member.tags.slice(0, 5).map((t, idx) => (
                              <Chip
                                key={idx}
                                label={`#${t}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: "0.5625rem", fontWeight: 700, height: 18 }}
                              />
                            ))}
                            {member.tags.length > 5 && (
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                +{member.tags.length - 5}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "primary.main", fontWeight: 700, flexShrink: 0 }}
                        >
                          View Profile
                        </Typography>
                      </Box>
                    </React.Fragment>
                  ))}
                </Paper>
              </Box>
            )}

            {/* 2. Active & Defended Research Projects */}
            {projects.length > 0 && (
              <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "0.1em" }}
                >
                  Research Projects ({projects.length})
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
                  {projects.map((proj, index) => (
                    <React.Fragment key={proj.id}>
                      {index > 0 && <Divider />}
                      <Box
                        component={Link}
                        href={`/projects/${proj.slug}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": { bgcolor: "action.hover" },
                          transition: "background-color 0.15s",
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ fontWeight: 700, color: "text.primary", display: "block" }}
                          >
                            {proj.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ color: "text.secondary", display: "block", mt: 0.25 }}
                          >
                            {proj.code ? `Code: ${proj.code} | ` : ""}Director: {proj.director || "Not Specified"}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "primary.main", fontWeight: 700, flexShrink: 0 }}
                        >
                          Explore Project
                        </Typography>
                      </Box>
                    </React.Fragment>
                  ))}
                </Paper>
              </Box>
            )}

            {/* 3. Dissertations & Thesis Projects */}
            {theses.length > 0 && (
              <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "0.1em" }}
                >
                  Academic Theses ({theses.length})
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
                  {theses.map((thesis, index) => (
                    <React.Fragment key={thesis.id}>
                      {index > 0 && <Divider />}
                      <Box
                        component={Link}
                        href={`/theses/${thesis.slug}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": { bgcolor: "action.hover" },
                          transition: "background-color 0.15s",
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "text.primary",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {thesis.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ color: "text.secondary", display: "block", mt: 0.25 }}
                          >
                            {thesis.level ? `${thesis.level} | ` : ""}Student: {thesis.student || "Not Specified"}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "primary.main", fontWeight: 700, flexShrink: 0 }}
                        >
                          View Thesis
                        </Typography>
                      </Box>
                    </React.Fragment>
                  ))}
                </Paper>
              </Box>
            )}

            {/* 4. Active Grants & Scholarships */}
            {scholarships.length > 0 && (
              <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "0.1em" }}
                >
                  Research Scholarships ({scholarships.length})
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
                  {scholarships.map((sch, index) => (
                    <React.Fragment key={sch.id}>
                      {index > 0 && <Divider />}
                      <Box
                        component={Link}
                        href={`/scholarships/${sch.slug}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": { bgcolor: "action.hover" },
                          transition: "background-color 0.15s",
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ fontWeight: 700, color: "text.primary", display: "block" }}
                          >
                            {sch.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ color: "text.secondary", display: "block", mt: 0.25 }}
                          >
                            {sch.type || "Scholarship"} | Student: {sch.student || "Not Specified"}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "primary.main", fontWeight: 700, flexShrink: 0 }}
                        >
                          View Scholarship
                        </Typography>
                      </Box>
                    </React.Fragment>
                  ))}
                </Paper>
              </Box>
            )}

            {/* 5. Scientific Publications */}
            {publications.length > 0 && (
              <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "0.1em" }}
                >
                  Scientific Bibliography ({publications.length})
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
                  {publications.map((pub, index) => {
                    const citation = formatCitation(pub, "apa");
                    return (
                      <React.Fragment key={pub.id}>
                        {index > 0 && <Divider />}
                        <Box
                          component={Link}
                          href={`/publications/${pub.slug}`}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            p: 2.5,
                            textDecoration: "none",
                            color: "inherit",
                            "&:hover": { bgcolor: "action.hover" },
                            transition: "background-color 0.15s",
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.4 }}
                            >
                              {pub.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              component="div"
                              sx={{ color: "text.secondary", fontWeight: 500 }}
                              dangerouslySetInnerHTML={{ __html: citation.html }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "primary.main", fontWeight: 700, flexShrink: 0, alignSelf: "center" }}
                          >
                            View Paper
                          </Typography>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
