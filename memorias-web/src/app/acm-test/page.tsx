import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AcmTestClient } from "./AcmTestClient";
import { Container, Box } from "@mui/material";

export default async function AcmTestPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header activeTab="members" />

      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <AcmTestClient />
      </Container>

      <Footer />
    </Box>
  );
}
