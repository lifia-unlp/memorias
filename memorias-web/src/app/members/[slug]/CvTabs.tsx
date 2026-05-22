"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, Card } from "@mui/material";

export function CvTabs({
  cvEs,
  cvEn,
  interestsEs,
  interestsEn,
}: {
  cvEs: string | null;
  cvEn: string | null;
  interestsEs: string | null;
  interestsEn: string | null;
}) {
  const [tabValue, setTabValue] = useState(0); // 0 = English, 1 = Spanish

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: 1, borderColor: "divider", pb: 1, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h3" sx={{ color: "primary.main", fontWeight: "bold" }}>
          Biography and Interests
        </Typography>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Biography language tabs"
          sx={{
            minHeight: "auto",
            "& .MuiTab-root": {
              minHeight: "auto",
              py: 1,
              px: 2,
              fontWeight: "bold",
              fontSize: "0.8rem",
            },
          }}
        >
          <Tab label="English" />
          <Tab label="Spanish" />
        </Tabs>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {tabValue === 0 ? (
          <>
            {cvEn ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    color: "secondary.main",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Short CV
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-line",
                    color: "text.primary",
                  }}
                >
                  {cvEn}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                No English biography provided.
              </Typography>
            )}

            {interestsEn && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    color: "secondary.main",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Research Interests
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-line",
                    color: "text.primary",
                  }}
                >
                  {interestsEn}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <>
            {cvEs ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    color: "secondary.main",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Breve CV
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-line",
                    color: "text.primary",
                  }}
                >
                  {cvEs}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                No Spanish biography provided.
              </Typography>
            )}

            {interestsEs && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    color: "secondary.main",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Intereses de Investigacion
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-line",
                    color: "text.primary",
                  }}
                >
                  {interestsEs}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Card>
  );
}
