import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PublicationForm } from "../../PublicationForm";
import { Container, Box, Typography } from "@mui/material";

type Params = Promise<{ slug: string }>;

export default async function EditPublicationPage({ params }: { params: Params }) {
  const session = await auth();
  if (
    !session?.user?.active ||
    (session.user.role !== "EDITOR" && session.user.role !== "ADMIN")
  ) {
    redirect("/publications");
  }

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const publication = await prisma.publication.findUnique({
    where: { slug },
    include: {
      members: { select: { id: true } },
      projects: { select: { id: true } },
      theses: { select: { id: true } },
    },
  });

  if (!publication) {
    notFound();
  }

  const members = await prisma.member.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });

  const projects = await prisma.project.findMany({
    select: { id: true, title: true, code: true },
    orderBy: { endDate: "desc" },
  });

  const theses = await prisma.thesis.findMany({
    select: { id: true, title: true, student: true },
    orderBy: { endDate: "desc" },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header activeTab="publications" />

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
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Edit Publication
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Update attributes, revise tags, or sync researcher and project relationships below.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <PublicationForm
          publication={publication}
          members={members}
          projects={projects}
          theses={theses}
        />
      </Container>
    </Box>
  );
}

