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
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #052438 0%, #093A54 100%)"
              : "linear-gradient(135deg, #093A54 0%, #0d4b6e 100%)",
          color: "white",
          py: 6,
          px: 3,
          boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Edit Scholarship: {scholarship.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Update scholarship type, supervisors, timelines, and associate connected research contexts.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
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
