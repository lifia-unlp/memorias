import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MemberForm } from "../MemberForm";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Container, Box, Typography } from "@mui/material";

export default async function NewMemberPage() {
  const session = await auth();
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");

  if (!isEditorOrAdmin) {
    redirect("/members");
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
            Create Researcher Profile
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600 }}>
            Bootstrap a new member profile in our portal registry. Accreditations, categories, and bilingual bios will be generated dynamically.
          </Typography>
        </Container>
      </Box>

      {/* Form Area */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <MemberForm systemOptions={systemOptions} />
      </Container>
    </Box>
  );
}
