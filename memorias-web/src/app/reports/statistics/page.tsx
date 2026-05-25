import React from "react";
import { Header } from "@/components/Header";
import { Container, Box, Typography, Button, Card, CardContent } from "@mui/material";
import { getStatisticsData } from "./actions";
import { StatisticsDashboard } from "@/components/statistics/StatisticsDashboard";
import Link from "next/link";

export default async function StatisticsPage() {
  let data = null;
  let errorMsg = "";

  try {
    data = await getStatisticsData();
  } catch (error: any) {
    errorMsg = error?.message || "An unexpected error occurred while loading statistics.";
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      
      {/* Server-side isolated Header */}
      <Header />

      {/* Hero Banner Section */}
      <Box 
        data-component-semantics="Hero banner"
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
            Statistics and Analytics
          </Typography>
          <Typography data-component-semantics="Hero subtitle" variant="body1" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Visual insights into the laboratory's scientific publications, academic training pipeline, and funding sponsors.
          </Typography>
        </Container>
      </Box>

      {/* Main Workspace Content */}
      <Container maxWidth="xl" sx={{ py: 6, flex: 1, display: "flex", flexDirection: "column" }}>
        {data ? (
          <StatisticsDashboard data={data} />
        ) : (
          <Box sx={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: 300 }}>
            <Card variant="outlined" sx={{ maxWidth: 500, width: "100%", borderRadius: 4, boxShadow: 2 }}>
              <CardContent sx={{ p: 4, textAlign: "center", display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h3" color="error" sx={{ fontWeight: 700 }}>
                  Access Restricted
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {errorMsg.includes("Unauthorized") 
                    ? "Active account session required. Please sign in to access laboratory research statistics." 
                    : errorMsg}
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button 
                    component={Link} 
                    href="/" 
                    variant="outlined" 
                    color="primary"
                    sx={{ borderRadius: 3, fontWeight: "bold" }}
                  >
                    Back to Home
                  </Button>
                  {errorMsg.includes("Unauthorized") && (
                    <Button 
                      component={Link} 
                      href="/api/auth/signin" 
                      variant="contained" 
                      color="primary"
                      sx={{ borderRadius: 3, fontWeight: "bold" }}
                    >
                      Sign In
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Container>

    </Box>
  );
}
