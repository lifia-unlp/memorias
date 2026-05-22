import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { PublicationForm } from "../PublicationForm";
import { Container, Box, Typography } from "@mui/material";

export default async function NewPublicationPage() {
  const session = await auth();
  if (
    !session?.user?.active ||
    (session.user.role !== "EDITOR" && session.user.role !== "ADMIN")
  ) {
    redirect("/publications");
  }

  // Fetch all options to populate relation selectors
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
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Add Publication
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Ingest and register a new scientific publication into the lab's bibliography system.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <PublicationForm
          members={members}
          projects={projects}
          theses={theses}
        />
      </Container>
    </Box>
  );
}
