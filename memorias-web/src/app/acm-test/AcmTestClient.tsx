"use client";

import React, { useState } from "react";
import { AcmCcsSelector } from "@/components/AcmCcsSelector";
import { safeParseAcmInterests } from "@/lib/acm-ccs-utils";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
} from "@mui/material";

export function AcmTestClient() {
  const [submittedData, setSubmittedData] = useState<string | null>(null);

  // Test values representing legacy raw text
  const legacyInterestValue = "I am interested in Distributed Systems, Semantic Web, and Mobile Computing.";
  
  // Test value representing serialized JSON array of ACM CCS IDs
  const acmInterestValue = JSON.stringify([
    "10010405.10010476.10010936.10010938", // E-government
    "10010520.10010521.10010542.10010550", // Quantum computing
    "10011007.10011074.10011081",          // Software product lines
  ]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const interests = formData.get("interestsInEnglish");
    setSubmittedData(interests as string);
  };

  const parsedAcmInterests = safeParseAcmInterests(acmInterestValue);
  const parsedLegacyInterests = safeParseAcmInterests(legacyInterestValue);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {/* Page Title & Heading */}
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            background: "linear-gradient(90deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          ACM Classification Component Mockup
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Testing the new hierarchical selection component in isolation before integrating into profile forms.
        </Typography>
      </Box>

      {/* 1. Component Live Playground Form */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 3, borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
            Form Editor Mockup Playground
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Embed AcmCcsSelector component */}
            <AcmCcsSelector initialValue={acmInterestValue} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ borderRadius: 2, px: 4, py: 1.25, fontWeight: "bold", textTransform: "none" }}
              >
                Submit Form (Simulated)
              </Button>
            </Box>
          </Box>

          {submittedData && (
            <Box sx={{ mt: 4, p: 2.5, borderRadius: 2, bgcolor: "rgba(0, 0, 0, 0.02)", border: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1, color: "text.primary" }}>
                Submitted Form Payload (value of interestsInEnglish):
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontFamily: "monospace",
                  p: 1.5,
                  bgcolor: "rgba(0, 0, 0, 0.05)",
                  borderRadius: 1.5,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {submittedData}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 2. Visual rendering checks */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 3, borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
            Bilingual CV Render Simulation (safeParseAcmInterests)
          </Typography>

          <Grid container spacing={4}>
            {/* Legacy Display Check */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1.5 }}>
                Legacy Plain Text Output (Fallback)
              </Typography>
              <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                {parsedLegacyInterests ? (
                  <Typography variant="body2">This should not happen.</Typography>
                ) : (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "secondary.main", textTransform: "uppercase", display: "block", mb: 1 }}>
                      Research Interests (Legacy Text)
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "text.primary" }}>
                      {legacyInterestValue}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* ACM Display Check */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1.5 }}>
                ACM CCS Taxonomy Path Rendering
              </Typography>
              <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                {parsedAcmInterests && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "secondary.main", textTransform: "uppercase", display: "block", mb: 0.5 }}>
                      Research Interests (ACM Classification)
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {parsedAcmInterests.map((interest) => (
                        <Box key={interest.id} sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                            {interest.label}
                          </Typography>
                          {interest.path.length > 1 && (
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {interest.path.slice(0, -1).join(" • ")}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
