import React from "react";
import { Header } from "@/components/Header";
import { getTagsWithCountsAdmin } from "./actions";
import { TagsCurationClient } from "./TagsCurationClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Box, Container } from "@mui/material";

export const metadata = {
  title: "Tag Curation Dashboard - Memorias Admin",
  description: "Search, merge, rename, and delete laboratory taxonomy tags globally across all records.",
};

export default async function AdminTagsPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    redirect("/");
  }

  const initialTags = await getTagsWithCountsAdmin();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      <Container component="main" maxWidth="lg" sx={{ py: 6, flexGrow: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <TagsCurationClient initialTags={initialTags} />
      </Container>
    </Box>
  );
}

