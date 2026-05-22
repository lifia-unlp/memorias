import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThesisForm } from "../../ThesisForm";
import { ensureEditorOrAdmin } from "../../actions";
import { Container, Box, Typography } from "@mui/material";

type Params = Promise<{ slug: string }>;

export default async function EditThesisPage({ params }: { params: Params }) {
  await ensureEditorOrAdmin();

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const thesis = await prisma.thesis.findUnique({
    where: { slug },
    include: {
      members: { select: { id: true } },
      projects: { select: { id: true } },
      publications: { select: { id: true } },
    },
  });

  if (!thesis) {
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

  const publications = await prisma.publication.findMany({
    select: {
      id: true,
      title: true,
      year: true,
    },
    orderBy: { year: "desc" },
  });

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
            Edit Thesis: {thesis.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Update thesis committee structure, milestones, associated lab resources, and slug attributes.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <ThesisForm
          initialData={thesis}
          members={members}
          projects={projects}
          publications={publications}
          levels={levels}
        />
      </Container>
    </Box>
  );
}
