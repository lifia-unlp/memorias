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
} from "@mui/material";
import { LinkListItemButton } from "@/components/reusable/LinkComponents";

interface ScholarshipData {
  id: string;
  title: string;
  slug: string;
  type?: string | null;
  fundingAgency?: string | null;
  student?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface RelatedScholarshipsProps {
  scholarships: ScholarshipData[];
  layout?: "grid" | "list";
}

export function RelatedScholarships({ scholarships, layout = "grid" }: RelatedScholarshipsProps) {
  if (!scholarships || scholarships.length === 0) return null;

  if (layout === "list") {
    return (
      <Card data-component-semantics="Related scholarships" sx={{ p: 1 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: "0.75rem",
              fontWeight: "extrabold",
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 1.5,
              mb: -0.5,
            }}
          >
            Related Scholarships
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0.5 }}>
            {scholarships.map((s) => (
              <LinkListItemButton
                key={s.id}
                href={`/scholarships/${s.slug}`}
              >
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      color: "text.primary",
                    }}
                  >
                    {s.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: "block", fontSize: "0.75rem" }}
                  >
                    Scholarship Details
                  </Typography>
                </Box>
              </LinkListItemButton>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box data-component-semantics="Related scholarships" sx={{ width: "100%" }}>
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
        Related Scholarships
      </Typography>
      <Grid container spacing={2}>
        {scholarships.map((s) => (
          <Grid size={{ xs: 12, sm: 6 }} key={s.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
              }}
              component={Link}
              href={`/scholarships/${s.slug}`}
            >
              <CardContent sx={{ flexGrow: 1, p: 2.5, "&:last-child": { pb: 2.5 }, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
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
                    {s.title}
                  </Typography>
                  {s.type && (
                    <Chip
                      label={s.type}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.625rem",
                        height: 20,
                        borderRadius: 1,
                      }}
                      data-component-semantics="Metadata badge"
                    />
                  )}
                </Box>

                {s.fundingAgency && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Funding Agency: {s.fundingAgency}
                  </Typography>
                )}

                {s.student && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Student: {s.student}
                  </Typography>
                )}

                {(s.startDate || s.endDate) && (
                  <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600, mt: "auto", display: "block" }}>
                    Timeline: {s.startDate ? new Date(s.startDate).getFullYear() : "N/A"} -{" "}
                    {s.endDate ? new Date(s.endDate).getFullYear() : "Present"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
