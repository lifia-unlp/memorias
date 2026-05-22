import React from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { ScholarshipForm } from "../ScholarshipForm";
import { ensureEditorOrAdmin } from "../actions";
import { Container, Box, Typography } from "@mui/material";

export default async function NewScholarshipPage() {
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
            Add New Scholarship
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Configure scholarship student profiles, directors, funding structures, and link co-authors or research projects.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <ScholarshipForm
          members={members}
          projects={projects}
          types={types}
        />
      </Container>
    </Box>
  );
}
