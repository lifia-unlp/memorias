import React from "react";
import Link from "next/link";
import { Card, Box, Typography, Chip } from "@mui/material";

interface ProjectSearchCardProps {
  project: {
    title: string;
    slug: string;
    code?: string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    director?: string | null;
    coDirector?: string | null;
    summary?: string | null;
    members: Array<{
      firstName: string;
      lastName: string;
      slug: string;
    }>;
    tags: string[];
  };
}

export function ProjectSearchCard({ project }: ProjectSearchCardProps) {
  const startStr = project.startDate
    ? new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "N/D";
  const endStr = project.endDate
    ? new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Ongoing";

  return (
    <Card
      data-component-semantics="Project search result card"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 3,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: "linear-gradient(90deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.3s ease",
          zIndex: 2,
        },
        "&:hover::before": {
          transform: "scaleX(1)",
        },
        "&:hover .project-card-title": {
          color: "primary.main",
          textDecoration: "underline",
        },
      }}
    >
      <Link
        href={`/projects/${project.slug}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
        }}
      />

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, position: "relative", zIndex: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: "1.1rem",
            fontWeight: "bold",
            lineHeight: 1.4,
          }}
        >
          <Box
            component="span"
            className="project-card-title"
            sx={{
              color: "text.primary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              transition: "color 0.2s",
            }}
          >
            {project.title}
          </Box>
        </Typography>
        {project.code && (
          <Chip
            label={`Code: ${project.code}`}
            size="small"
            sx={{
              fontWeight: "bold",
              fontSize: "0.625rem",
              height: 18,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
              color: "text.secondary",
              flexShrink: 0,
            }}
            data-component-semantics="Metadata badge"
          />
        )}
      </Box>

      <Box
        sx={{
          bgcolor: "action.hover",
          p: 2,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          fontSize: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mb: 2,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5, color: "text.secondary" }}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Timeline:
          </Typography>
          <Typography variant="caption">
            {startStr} - {endStr}
          </Typography>
        </Box>

        {(project.director || project.coDirector) && (
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
            {project.director && (
              <Typography variant="caption" sx={{ color: "text.primary" }}>
                <strong>Director:</strong> {project.director}
              </Typography>
            )}
            {project.coDirector && (
              <Typography variant="caption" sx={{ color: "text.primary" }}>
                <strong>Co-Director:</strong> {project.coDirector}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {project.summary && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            lineHeight: 1.6,
            fontSize: "0.8rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            position: "relative",
            zIndex: 2,
          }}
        >
          {project.summary}
        </Typography>
      )}

      {project.members && project.members.length > 0 && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2, mt: "auto", mb: project.tags.length > 0 ? 2 : 0, position: "relative", zIndex: 4 }}>
          <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary", display: "block", mb: 0.5 }}>
            Associated Members:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
            {project.members.map((member, i) => (
              <React.Fragment key={member.slug}>
                <Link
                  href={`/members/${member.slug}`}
                  style={{ textDecoration: "none", position: "relative", zIndex: 4 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: "primary.main",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {member.firstName} {member.lastName}
                  </Typography>
                </Link>
                {i < project.members.length - 1 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                    ,
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}

      {project.tags.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, pt: (project.members && project.members.length > 0) ? 0 : 2, mt: (project.members && project.members.length > 0) ? 0 : "auto", position: "relative", zIndex: 4 }}>
          {project.tags.slice(0, 4).map((tag: string) => (
            <Link key={tag} href={`/tags/${tag}`} style={{ textDecoration: "none" }}>
              <Chip
                label={`#${tag}`}
                size="small"
                sx={{
                  fontSize: "0.625rem",
                  height: 18,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "primary.light",
                  bgcolor: "primary.light",
                  color: "primary.main",
                  fontWeight: "bold",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "common.white",
                  },
                }}
                data-component-semantics="Tag badge"
              />
            </Link>
          ))}
        </Box>
      )}
    </Card>
  );
}
