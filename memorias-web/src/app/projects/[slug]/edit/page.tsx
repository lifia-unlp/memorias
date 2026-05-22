import React from "react";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../../ProjectForm";
import { Header } from "@/components/Header";
import { Container, Box, Typography } from "@mui/material";

type Params = Promise<{ slug: string }>;

export default async function EditProjectPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      members: {
        select: { id: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  if (!isEditorOrAdmin) {
    redirect(`/projects/${slug}`);
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
            Edit Project: {project.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Modify research categorizations, dates, funding amounts, and associated member listings.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <ProjectForm initialData={project} members={members} />
      </Container>
    </Box>
  );
}
