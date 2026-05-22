import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CvTabs } from "./CvTabs";
import { DeleteMemberButton } from "./DeleteMemberButton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RelatedProjects } from "@/components/reusable/RelatedProjects";
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

export default async function MemberDetailPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Fetch Member
  const member = await prisma.member.findUnique({
    where: { slug },
  });

  if (!member) {
    notFound();
  }

  // 2. Fetch Projects involving this member (as Director, Co-Director, or Team Member)
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { director: member.id },
        { coDirector: member.id },
        { members: { some: { id: member.id } } },
      ],
    },
    orderBy: { startDate: "desc" },
  });

  // 3. Fetch Theses involving this member
  const theses = await prisma.thesis.findMany({
    where: {
      OR: [
        { student: member.id },
        { director: member.id },
        { coDirector: member.id },
        { members: { some: { id: member.id } } },
      ],
    },
    orderBy: { startDate: "desc" },
  });

  // 4. Fetch Scholarships
  const scholarships = await prisma.scholarship.findMany({
    where: {
      OR: [
        { student: member.id },
        { director: member.id },
        { coDirector: member.id },
        { members: { some: { id: member.id } } },
      ],
    },
    orderBy: { startDate: "desc" },
  });

  // 5. Fetch Publications
  const publications = await prisma.publication.findMany({
    where: {
      members: { some: { id: member.id } },
    },
    orderBy: { year: "desc" },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Unified Navigation Header */}
      <Header activeTab="members" />

      {/* Main Layout Container */}
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 4,
        }}
      >
        {/* Left Column: Profile Card & Contacts */}
        <Box sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <Card
            sx={{
              p: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "6px",
                background: (theme) =>
                  `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, pt: 1, mb: 3 }}>
              <Avatar
                src={member.avatarUrl || undefined}
                alt={`${member.firstName} ${member.lastName}`}
                sx={{
                  width: 112,
                  height: 112,
                  bgcolor: "primary.light",
                  color: "primary.main",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  border: "2px solid",
                  borderColor: "primary.light",
                  boxShadow: 1,
                }}
              >
                {!member.avatarUrl && `${member.firstName[0]}${member.lastName[0]}`}
              </Avatar>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h2" sx={{ fontSize: "1.35rem", fontWeight: "bold", mb: 0.5 }}>
                  {member.firstName} {member.lastName}
                </Typography>
                {member.positionAtLab && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: "secondary.main",
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      display: "block",
                    }}
                  >
                    {member.positionAtLab}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Scientific Credentials */}
            <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2, mb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "extrabold",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Scientific Accreditations
              </Typography>

              {member.highestDegree && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary", display: "block" }}>
                    Degree
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.highestDegree}
                  </Typography>
                </Box>
              )}

              {member.positionAtCONICET && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary", display: "block" }}>
                    CONICET
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.positionAtCONICET}
                  </Typography>
                </Box>
              )}

              {member.positionAtCIC && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary", display: "block" }}>
                    CIC Position
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.positionAtCIC}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Communication Details */}
            <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2, mb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "extrabold",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Contact and Profiles
              </Typography>

              {member.institutionalEmail && (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap", overflow: "hidden" }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                    Email:
                  </Typography>
                  <Typography
                    variant="caption"
                    component="a"
                    href={`mailto:${member.institutionalEmail}`}
                    sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {member.institutionalEmail}
                  </Typography>
                </Box>
              )}

              {member.personalEmail && (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap", overflow: "hidden" }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                    Personal:
                  </Typography>
                  <Typography
                    variant="caption"
                    component="a"
                    href={`mailto:${member.personalEmail}`}
                    sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {member.personalEmail}
                  </Typography>
                </Box>
              )}

              {member.webPage && (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                    Website:
                  </Typography>
                  <Typography
                    variant="caption"
                    component="a"
                    href={member.webPage}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    Personal Web Page
                  </Typography>
                </Box>
              )}

              {member.orcid && (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                    ORCID:
                  </Typography>
                  <Typography
                    variant="caption"
                    component="a"
                    href={`https://orcid.org/${member.orcid}`}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "primary.main", textDecoration: "none", fontWeight: "bold", "&:hover": { textDecoration: "underline" } }}
                  >
                    {member.orcid}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Tags */}
            {member.tags.length > 0 && (
              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2, mb: 3, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {member.tags.map((tag, idx) => (
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
              </Box>
            )}

            {/* Actions Panel */}
            {isEditorOrAdmin && (
              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  component={Link}
                  href={`/members/${member.slug}/edit`}
                  variant="contained"
                  fullWidth
                  sx={{ borderRadius: 3, fontWeight: "bold" }}
                >
                  Edit Profile
                </Button>
                <DeleteMemberButton memberId={member.id} memberName={`${member.firstName} ${member.lastName}`} />
              </Box>
            )}
          </Card>
        </Box>

        {/* Right Column: CV Tabs & Related Database Lists */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {/* 1. Spanish/English Controlled Tabs */}
          <CvTabs
            cvEs={member.shortCvInSpanish}
            cvEn={member.shortCvInEnglish}
            interestsEs={member.interestsInSpanish}
            interestsEn={member.interestsInEnglish}
          />

          {/* 2. Associated Projects */}
          {projects.length > 0 && <RelatedProjects projects={projects} />}

          {/* 3. Associated Theses */}
          {theses.length > 0 && <RelatedTheses theses={theses} />}

          {/* 4. Associated Scholarships */}
          {scholarships.length > 0 && (
            <Box sx={{ width: "100%" }}>
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
                Associated Scholarships
              </Typography>
              <Grid container spacing={2}>
                {scholarships.map((s) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={s.id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        textDecoration: "none",
                      }}
                      component={Link}
                      href={`/scholarships/${s.slug}`}
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
                            {s.title}
                          </Typography>
                          {s.type && (
                            <Chip
                              label={s.type}
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
                        {s.fundingAgency && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                            Funding Agency: {s.fundingAgency}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600, mt: "auto" }}>
                          Timeline: {s.startDate ? new Date(s.startDate).getFullYear() : "N/A"} -{" "}
                          {s.endDate ? new Date(s.endDate).getFullYear() : "Present"}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* 5. Associated Publications */}
          {publications.length > 0 && <RelatedPublications publications={publications} />}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
