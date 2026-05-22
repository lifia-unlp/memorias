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
            Edit Publication
          </Typography>
          <Typography data-component-semantics="Hero subtitle" variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Update attributes, revise tags, or sync researcher and project relationships below.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="xl" sx={{ py: 6, flex: 1 }}>
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

