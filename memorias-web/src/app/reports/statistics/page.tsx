import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { Header } from "@/components/Header";
import {
  Container,
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Grid,
  Skeleton,
} from "@mui/material";
import Link from "next/link";

export default function StatisticsPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Unified Navigation Header */}
      <Header />

      <Container maxWidth="md" sx={{ py: 8, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 4 }}>
        
        {/* Animated Construction Vector SVG Icon (Replacing Emoji) */}
        <Box sx={{ position: "relative", width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ position: "absolute", inset: 0, borderRadius: "24px", bgcolor: "secondary.main", opacity: 0.1, animation: "pulse 2s infinite" }} />
          <Box
            sx={{
              position: "absolute",
              inset: 8,
              borderRadius: "16px",
              background: "linear-gradient(135deg, var(--mui-palette-secondary-main) 0%, var(--mui-palette-secondary-dark) 100%)",
              opacity: 0.15,
              animation: "spin 10s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" }
              }
            }}
          />
          
          <Box sx={{ position: "relative" }}>
            <svg style={{ width: 48, height: 48 }} className="text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Box>
        </Box>

        {/* Text Headers */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Chip
            label="Coming Soon"
            color="secondary"
            size="small"
            sx={{ fontWeight: "bold", fontSize: "0.625rem", px: 1 }}
          />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: "text.primary" }}>
            Statistics and Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, fontSize: "0.875rem", lineHeight: 1.6 }}>
            This module is currently under construction. Soon, you will be able to visualize yearly research growth, funding breakdowns, and co-authorship graphs.
          </Typography>
        </Box>

        {/* Wireframe Mockup of Future Charts */}
        <Card
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 640,
            borderRadius: 4,
            p: 3,
            position: "relative",
            overflow: "hidden",
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "background.default",
              opacity: 0.5,
              backdropFilter: "blur(1px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Chip
              label="Design in Progress"
              sx={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                bgcolor: "text.primary",
                color: "background.paper",
                boxShadow: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider", pb: 2, mb: 3 }}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={60} height={20} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Box 1 */}
            <Grid size={{ xs: 4 }}>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Skeleton variant="text" width="60%" height={15} />
                <Skeleton variant="text" width="40%" height={24} />
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-end", height: 64, pt: 2 }}>
                  <Box sx={{ width: "100%", bgcolor: "action.hover", height: "20%", borderRadius: 0.5 }} />
                  <Box sx={{ width: "100%", bgcolor: "action.selected", height: "50%", borderRadius: 0.5 }} />
                  <Box sx={{ width: "100%", bgcolor: "action.disabled", height: "80%", borderRadius: 0.5 }} />
                </Box>
              </Box>
            </Grid>

            {/* Box 2 */}
            <Grid size={{ xs: 4 }}>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Skeleton variant="text" width="50%" height={15} />
                <Skeleton variant="text" width="70%" height={24} />
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-end", height: 64, pt: 2 }}>
                  <Box sx={{ width: "100%", bgcolor: "action.hover", height: "70%", borderRadius: 0.5 }} />
                  <Box sx={{ width: "100%", bgcolor: "action.selected", height: "40%", borderRadius: 0.5 }} />
                  <Box sx={{ width: "100%", bgcolor: "action.disabled", height: "90%", borderRadius: 0.5 }} />
                </Box>
              </Box>
            </Grid>

            {/* Box 3 */}
            <Grid size={{ xs: 4 }}>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Skeleton variant="text" width="70%" height={15} />
                <Skeleton variant="text" width="50%" height={24} />
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-end", height: 64, pt: 2 }}>
                  <Box sx={{ width: "100%", bgcolor: "action.hover", height: "40%", borderRadius: 0.5 }} />
                  <Box sx={{ width: "100%", bgcolor: "action.selected", height: "80%", borderRadius: 0.5 }} />
                  <Box sx={{ width: "100%", bgcolor: "action.disabled", height: "30%", borderRadius: 0.5 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Line Chart Wireframe */}
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            <Skeleton variant="text" width={140} height={15} sx={{ mb: 1 }} />
            <Box
              sx={{
                position: "relative",
                height: 96,
                borderLeft: "1px solid",
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
              }}
            >
              <svg style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, width: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,80 Q25,20 50,60 T100,30 L100,100 L0,100 Z" fill="rgba(229, 98, 38, 0.1)" />
                <path d="M0,80 Q25,20 50,60 T100,30" fill="none" stroke="#E56226" strokeWidth="3" />
              </svg>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#E56226", position: "absolute", left: "25%", bottom: "75%" }} />
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#E56226", position: "absolute", left: "50%", bottom: "35%" }} />
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#E56226", position: "absolute", left: "75%", bottom: "65%" }} />
            </Box>
          </Box>
        </Card>

        {/* Back Button */}
        <Box>
          <LinkButton 
            href="/"
            variant="contained"
            color="primary"
            sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", px: 4, py: 1.5, borderRadius: 3 }}
          >
            Back to Home
          </LinkButton>
        </Box>
      </Container>
    </Box>
  );
}

