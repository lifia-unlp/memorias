import React from "react";
import { Header } from "@/components/Header";
import FollowUpClient from "./FollowUpClient";
import { Container, Box, Typography } from "@mui/material";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllFollowUpItems, getActiveMembers, getCurrentUserMember } from "./actions";
import { prisma } from "@/lib/prisma";

export default async function PersonalFollowUpPage() {
  const session = await auth();
  if (!session || !session.user?.active) {
    redirect("/auth/signin");
  }

  const initialItems = await getAllFollowUpItems(true);
  const members = await getActiveMembers();
  const currentMember = await getCurrentUserMember();

  // Load all realizations for matching/edit dropdowns
  const publications = await prisma.publication.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });
  const projects = await prisma.project.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });
  const theses = await prisma.thesis.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });
  const scholarships = await prisma.scholarship.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      {/* Hero Banner Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
          color: "common.white",
          py: 5,
          px: 3,
          boxShadow: "inset 0px -4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h4" component="h1" sx={{ color: "common.white", fontWeight: 700, mb: 1 }}>
            Follow-Up Items & Pipelines
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Track research milestones, publication deadlines, active grants, and degree theses.
          </Typography>
        </Container>
      </Box>

      {/* Workspace */}
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column" }}>
        <FollowUpClient
          initialItems={JSON.parse(JSON.stringify(initialItems))}
          members={JSON.parse(JSON.stringify(members))}
          currentMember={JSON.parse(JSON.stringify(currentMember))}
          publications={JSON.parse(JSON.stringify(publications))}
          projects={JSON.parse(JSON.stringify(projects))}
          theses={JSON.parse(JSON.stringify(theses))}
          scholarships={JSON.parse(JSON.stringify(scholarships))}
        />
      </Container>
    </Box>
  );
}
