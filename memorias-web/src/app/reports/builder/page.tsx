import React from "react";
import { Header } from "@/components/Header";
import ReportBuilderClient from "./ReportBuilderClient";
import { Container, Box } from "@mui/material";

export default function ReportBuilderPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      
      {/* Server-side Header - perfectly isolated from client Webpack bundles */}
      <Header />

      {/* Client-side Workspace */}
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column" }}>
        <ReportBuilderClient />
      </Container>

    </Box>
  );
}

