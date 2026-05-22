"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, Box, Typography, Chip } from "@mui/material";

interface TagWithCount {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tags: TagWithCount[];
  limit?: number;
}

export function TagCloud({ tags, limit = 40 }: TagCloudProps) {
  const visibleTags = tags.slice(0, limit);

  if (visibleTags.length === 0) {
    return null;
  }

  // Find min/max counts for weight calculations
  const counts = visibleTags.map((t) => t.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const spread = maxCount - minCount || 1;

  return (
    <Card sx={{ borderRadius: 4, width: "100%" }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        {/* Title & Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
            mb: 2,
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ fontSize: "1.1rem", fontWeight: 800 }}>
              Explore by Research Topic
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.725rem", mt: 0.5 }}>
              Click on a keyword to discover all related laboratory works and members.
            </Typography>
          </Box>
          <Chip
            label={`${tags.length} Total Topics`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.675rem",
              fontWeight: "bold",
              color: "text.secondary",
              borderColor: "divider",
              borderRadius: 1.5,
            }}
          />
        </Box>

        {/* Cloud Wrapper */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.25,
            justifyContent: "center",
            py: 2,
          }}
        >
          {visibleTags.map(({ tag, count }) => {
            const weight = (count - minCount) / spread;

            // Generate customized styles based on weight
            const saturation = Math.round(45 + weight * 40);
            const tagColor = `hsl(215, ${saturation}%, 42%)`;

            let fontSize = "0.75rem";
            let fontWeight = 600;
            if (weight > 0.8) {
              fontSize = "1rem";
              fontWeight = 800;
            } else if (weight > 0.5) {
              fontSize = "0.875rem";
              fontWeight = 700;
            } else if (weight > 0.2) {
              fontSize = "0.8rem";
              fontWeight = 700;
            }

            return (
              <Chip
                key={tag}
                label={tag}
                component={Link}
                href={`/tags/${encodeURIComponent(tag)}`}
                clickable
                variant="outlined"
                sx={{
                  fontSize: fontSize,
                  fontWeight: fontWeight,
                  borderRadius: 2,
                  px: 0.5,
                  py: 1.75,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.01)",
                  borderColor: `hsla(215, ${saturation}%, 50%, 0.25)`,
                  color: (theme) => (theme.palette.mode === "dark" ? "primary.light" : tagColor),
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05) translateY(-1px)",
                    borderColor: "primary.main",
                    bgcolor: "primary.light",
                  },
                }}
                avatar={
                  <Avatar
                    sx={{
                      width: 18,
                      height: 18,
                      fontSize: "0.625rem",
                      fontWeight: "bold",
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      ml: 0.5,
                    }}
                  >
                    {count}
                  </Avatar>
                }
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
import { Avatar } from "@mui/material";
