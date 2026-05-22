import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectForm } from "../ProjectForm";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Container, Box, Typography } from "@mui/material";

export default async function NewProjectPage() {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  if (!isEditorOrAdmin) {
    redirect("/projects");
  }

  // Fetch members to populate the association grid
  const members = await prisma.member.findMany({
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      positionAtLab: true,
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header activeTab="projects" />

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
            Create Research Project
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Launch a new research project profile. Funding agency allocations, website redirects, and associated members will be linked dynamically.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <ProjectForm members={members} />
      </Container>
    </Box>
  );
}
