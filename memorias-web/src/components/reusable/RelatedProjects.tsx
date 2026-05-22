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

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  code: string | null;
  fundingAgency: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface RelatedProjectsProps {
  projects: ProjectData[];
}

export function RelatedProjects({ projects }: RelatedProjectsProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <Box data-component-semantics="Relevant projects" sx={{ width: "100%" }}>
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
        Relevant projects
      </Typography>
      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, sm: 6 }} key={project.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
              }}
              component={Link}
              href={`/projects/${project.slug}`}
            >
              <CardContent sx={{ flexGrow: 1, p: 2, "&:last-child": { pb: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1.5,
                    mb: 1.25,
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
                    {project.title}
                  </Typography>
                  {project.code && (
                    <Chip
                      label={project.code}
                      size="small"
                      color="primary"
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

                {project.fundingAgency && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Agency: {project.fundingAgency}
                  </Typography>
                )}

                {project.startDate && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.disabled",
                      fontSize: "0.675rem",
                      fontWeight: 600,
                      mt: "auto",
                      display: "block",
                    }}
                  >
                    Timeline: {new Date(project.startDate).getFullYear()} -{" "}
                    {project.endDate ? new Date(project.endDate).getFullYear() : "Present"}
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
