import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { ScholarshipForm } from "../ScholarshipForm";
import { ensureEditorOrAdmin } from "@/lib/auth-helpers";
import { memberService } from "@/lib/services/memberService";
import { projectService } from "@/lib/services/projectService";
import { thesisService } from "@/lib/services/thesisService";
import { Container, Box, Typography } from "@mui/material";

export default async function NewScholarshipPage() {
  await ensureEditorOrAdmin();

  // Load relation datasets using service methods
  const members = await memberService.getFormSelectionList();
  const projects = await projectService.getFormSelectionList();
  const theses = await thesisService.getFormSelectionList();

  const typeOptions = await prisma.systemOption.findMany({
    where: { listName: "scholarshipType" },
    select: { value: true },
  });
  let types = typeOptions.map((o) => o.value);
  if (types.length === 0) {
    types = ["Doctoral", "Postdoctoral", "Training"];
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header activeTab="scholarships" />

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
            Add New Scholarship
          </Typography>
          <Typography data-component-semantics="Hero subtitle" variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Configure scholarship student profiles, directors, funding structures, and link co-authors or research projects.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="xl" sx={{ py: 6, flex: 1 }}>
        <ScholarshipForm
          members={members}
          projects={projects}
          theses={theses}
          types={types}
        />
      </Container>
    </Box>
  );
}
