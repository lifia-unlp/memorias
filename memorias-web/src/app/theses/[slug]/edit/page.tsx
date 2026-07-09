import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThesisForm } from "../../ThesisForm";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { Container, Box, Typography } from "@mui/material";
import { thesisService } from "@/lib/services/thesisService";
import { memberService } from "@/lib/services/memberService";
import { projectService } from "@/lib/services/projectService";
import { publicationService } from "@/lib/services/publicationService";
import { scholarshipService } from "@/lib/services/scholarshipService";

type Params = Promise<{ slug: string }>;

export default async function EditThesisPage({ params }: { params: Params }) {
  await ensureEditorOrAdmin();

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const thesis = await thesisService.getBySlug(slug);

  if (!thesis) {
    notFound();
  }

  // Load relation datasets
  const members = await memberService.getFormSelectionList();
  const projects = await projectService.getFormSelectionList();
  const publications = await publicationService.getFormSelectionList();
  const scholarships = await scholarshipService.getFormSelectionList();

  const levelOptions = await prisma.systemOption.findMany({
    where: { listName: "thesisLevel" },
    select: { value: true },
  });
  let levels = levelOptions.map((o) => o.value);
  if (levels.length === 0) {
    levels = ["PhD", "Masters", "Grade"];
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header activeTab="theses" />

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
          <Typography data-component-semantics="Hero title" variant="h1" sx={{ color: "common.white", mb: 1, fontSize: { xs: "2rem", md: "2.5rem" } }}>
            Edit Thesis: {thesis.title}
          </Typography>
          <Typography data-component-semantics="Hero subtitle" variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Update thesis committee structure, milestones, associated lab resources, and slug attributes.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="xl" sx={{ py: 6, flex: 1 }}>
        <ThesisForm
          initialData={thesis}
          members={members}
          projects={projects}
          publications={publications}
          scholarships={scholarships}
          levels={levels}
        />
      </Container>
    </Box>
  );
}
