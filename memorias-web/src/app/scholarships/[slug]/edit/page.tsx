import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ScholarshipForm } from "../../ScholarshipForm";
import { ensureEditorOrAdmin } from "../../actions";
import { Container, Box, Typography } from "@mui/material";

type Params = Promise<{ slug: string }>;

export default async function EditScholarshipPage({ params }: { params: Params }) {
  await ensureEditorOrAdmin();

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const scholarship = await prisma.scholarship.findUnique({
    where: { slug },
    include: {
      members: { select: { id: true } },
      projects: { select: { id: true } },
    },
  });

  if (!scholarship) {
    notFound();
  }

  // Load relation datasets
  const members = await prisma.member.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      positionAtLab: true,
    },
    orderBy: { lastName: "asc" },
  });

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { title: "asc" },
  });

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
            Edit Scholarship: {scholarship.title}
          </Typography>
          <Typography data-component-semantics="Hero subtitle" variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Update scholarship type, supervisors, timelines, and associate connected research contexts.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="xl" sx={{ py: 6, flex: 1 }}>
        <ScholarshipForm
          initialData={scholarship}
          members={members}
          projects={projects}
          types={types}
        />
      </Container>
    </Box>
  );
}
