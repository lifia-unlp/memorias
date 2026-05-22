import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { ThesisForm } from "../ThesisForm";
import { ensureEditorOrAdmin } from "../actions";
import { Container, Box, Typography } from "@mui/material";

export default async function NewThesisPage() {
  await ensureEditorOrAdmin();

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
          background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
          color: "white",
          py: 6,
          px: 3,
          boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Add New Thesis
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Configure thesis details, students, academic levels, timeline progress, and connect research networks.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <ThesisForm
          members={members}
          projects={projects}
          publications={publications}
          levels={levels}
        />
      </Container>
    </Box>
  );
}
