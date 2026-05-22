import React from "react";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemberForm } from "../../MemberForm";
import { Header } from "@/components/Header";
import { Container, Box, Typography } from "@mui/material";

type Params = Promise<{ slug: string }>;

export default async function EditMemberPage({ params }: { params: Params }) {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const member = await prisma.member.findUnique({
    where: { slug },
  });

  if (!member) {
    notFound();
  }

  if (!isEditorOrAdmin) {
    redirect(`/members/${slug}`);
  }

  // Fetch all database configurable lists options
  const systemOptions = await prisma.systemOption.findMany({
    orderBy: { value: "asc" },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header activeTab="members" />

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
            Edit Profile: {member.firstName} {member.lastName}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Modify research categorizations, accreditations, web identifiers, and bilingual short-cv biographies.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <MemberForm initialData={member} systemOptions={systemOptions} />
      </Container>
    </Box>
  );
}
