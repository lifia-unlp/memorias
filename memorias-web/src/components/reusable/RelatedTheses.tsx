"use client";

import React from "react";
import Link from "next/link";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
} from "@mui/material";

interface ThesisData {
  id: string;
  title: string;
  slug: string;
  student: string | null;
  level: string | null;
  progress: number | null;
  career?: string | null;
}

interface RelatedThesesProps {
  theses: ThesisData[];
}

export function RelatedTheses({ theses }: RelatedThesesProps) {
  if (!theses || theses.length === 0) return null;

  return (
    <Box data-component-semantics="Relevant theses" sx={{ width: "100%" }}>
      <Typography
        variant="h3"
        sx={{
          mb: 2.5,
          fontSize: "1.15rem",
          fontWeight: 700,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1,
        }}
      >
        Relevant theses
      </Typography>
      <Grid container spacing={2}>
        {theses.map((thesis) => (
          <Grid size={{ xs: 12, sm: 6 }} key={thesis.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
              }}
              component={Link}
              href={`/theses/${thesis.slug}`}
            >
              <CardContent sx={{ flexGrow: 1, p: 2, "&:last-child": { pb: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      color: "text.primary",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {thesis.title}
                  </Typography>
                  {thesis.level && (
                    <Chip
                      label={thesis.level}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.625rem",
                        height: 20,
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    mb: 1.5,
                  }}
                >
                  Student: {thesis.student || "Not specified"}
                </Typography>

                {thesis.progress !== null && (
                  <Box sx={{ mt: "auto" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: 700 }}>
                        Progress
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: 700 }}>
                        {thesis.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={thesis.progress}
                      sx={{
                        height: 5,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
