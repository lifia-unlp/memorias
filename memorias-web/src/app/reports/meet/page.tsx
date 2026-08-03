import React from "react";
import { Header } from "@/components/Header";
import MeetClient from "./MeetClient";
import { Container, Box, Typography } from "@mui/material";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActiveFollowUpItems, getRecentFollowUpChanges } from "../follow-up/actions";

export default async function MeetingPage() {
  const session = await auth();
  if (!session || !session.user?.active) {
    redirect("/auth/signin");
  }

  const initialItems = await getActiveFollowUpItems();
  const recentChanges = await getRecentFollowUpChanges(90); // Last 90 days for wider range filter

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
            Follow-Up Meeting Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Review progress updates, log meeting decisions, and coordinate future submissions.
          </Typography>
        </Container>
      </Box>

      {/* Workspace */}
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column" }}>
        <MeetClient
          initialItems={JSON.parse(JSON.stringify(initialItems))}
          recentChanges={JSON.parse(JSON.stringify(recentChanges))}
        />
      </Container>
    </Box>
  );
}
