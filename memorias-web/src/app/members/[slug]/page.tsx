import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { memberService } from "@/lib/services/memberService";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CvTabs } from "./CvTabs";
import { DeleteMemberButton } from "./DeleteMemberButton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RelatedProjects } from "@/components/reusable/RelatedProjects";
import { RelatedTheses } from "@/components/reusable/RelatedTheses";
import { RelatedScholarships } from "@/components/reusable/RelatedScholarships";
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

  // Fetch Member details and deep relations using memberService
  const details = await memberService.getMemberDetail(slug);

  if (!details) {
    notFound();
  }

  const { member, projects, theses, scholarships, publications } = details;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Unified Navigation Header */}
      <Header activeTab="members" />

      {/* Main Layout Container */}
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
        {/* Left Column: Profile Card & Contacts */}
        <Box sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <Card
            data-component-semantics="Member Profile Card"
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
                background: "linear-gradient(90deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
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

                {((member.startDate) || member.endDate) && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                      mt: 0.5,
                      fontWeight: "medium",
                    }}
                  >
                    {member.endDate ? (
                      <>
                        Member {member.startDate && `from ${new Date(member.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })} `}
                        to {new Date(member.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                      </>
                    ) : (
                      member.startDate && `Member since ${new Date(member.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`
                    )}
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

            {/* Teaching at UNLP */}
            {(member.positionAtUnlp || member.coursesAtUNLP) && (
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
                  Teaching at UNLP
                </Typography>

                {member.positionAtUnlp && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary", display: "block" }}>
                      Position
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.positionAtUnlp}
                    </Typography>
                  </Box>
                )}

                {member.coursesAtUNLP && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary", display: "block" }}>
                      Courses
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                      {member.coursesAtUNLP}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

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

              {member.googleResearchProfile && (
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <svg style={{ width: 16, height: 16, color: "var(--mui-palette-text-secondary)", marginRight: 6 }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
                  </svg>
                  <Typography
                    variant="caption"
                    component="a"
                    href={member.googleResearchProfile}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    Google Scholar
                  </Typography>
                </Box>
              )}

              {member.researchGateProfile && (
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <svg style={{ width: 16, height: 16, color: "var(--mui-palette-text-secondary)", marginRight: 6 }} viewBox="0 0 29 29" fill="currentColor">
                    <path d="M15.006 18.003c0-1.127-.374-2.176-1.002-3.023 1.488-1.258 2.496-3.136 2.496-5.265C16.5 5.589 12.91 2 8.5 2H2v25h6.5c4.41 0 8-3.589 8-7.715 0-1.139-.258-2.222-.727-3.195 1.737-1.365 2.733-3.468 2.733-5.807zM8.5 4c3.033 0 5.5 2.467 5.5 5.5S11.533 15 8.5 15H4V4h4.5zM8.5 25H4v-8h4.5c3.033 0 5.5 2.467 5.5 5.5S11.533 25 8.5 25zm13.5-23c-1.104 0-2 .896-2 2v21c0 1.104.896 2 2 2h3c1.104 0 2-.896 2-2V4c0-1.104-.896-2-2-2h-3z" />
                  </svg>
                  <Typography
                    variant="caption"
                    component="a"
                    href={member.researchGateProfile}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    ResearchGate
                  </Typography>
                </Box>
              )}

              {member.dblpProfile && (
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <svg style={{ width: 16, height: 16, color: "var(--mui-palette-text-secondary)", marginRight: 6 }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6H2v14h14v-2H6V6zm16-4H8v14h12V2zm-2 10H10V4h8v8z" />
                  </svg>
                  <Typography
                    variant="caption"
                    component="a"
                    href={member.dblpProfile}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    DBLP Profile
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
            )}

            {/* Actions Panel */}
            {isEditorOrAdmin && (
              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <LinkButton 
                  href={`/members/${member.slug}/edit`}
                  variant="contained"
                  fullWidth
                  sx={{ borderRadius: 3, fontWeight: "bold" }}
                >
                  Edit Profile
                </LinkButton>
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
            <RelatedScholarships scholarships={scholarships} layout="grid" />
          )}

          {/* 5. Associated Publications */}
          {publications.length > 0 && <RelatedPublications publications={publications} />}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
