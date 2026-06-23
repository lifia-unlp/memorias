import React from "react";
import Link from "next/link";
import { Card, Box, Typography, Chip, LinearProgress } from "@mui/material";

interface ThesisSearchCardProps {
  thesis: {
    title: string;
    slug: string;
    level?: string | null;
    progress?: number | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    student?: string | null;
    director?: string | null;
    coDirector?: string | null;
    summary?: string | null;
    tags: string[];
  };
}

export function ThesisSearchCard({ thesis: ths }: ThesisSearchCardProps) {
  const startYearStr = ths.startDate
    ? new Date(ths.startDate).getFullYear()
    : "N/D";
  const endYearStr = ths.endDate
    ? new Date(ths.endDate).getFullYear()
    : ths.progress === 100
    ? "Completed"
    : "Ongoing";

  return (
    <Card
      data-component-semantics="Thesis search result card"
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
          background: "linear-gradient(90deg, var(--mui-palette-secondary-main), var(--mui-palette-primary-main) 40%)",
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.3s ease",
          zIndex: 2,
        },
        "&:hover::before": {
          transform: "scaleX(1)",
        },
        "&:hover .thesis-card-title": {
          color: "primary.main",
          textDecoration: "underline",
        },
      }}
    >
      <Link
        href={`/theses/${ths.slug}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5, position: "relative", zIndex: 2 }}>
        {ths.level && (
          <Chip
            label={ths.level}
            size="small"
            sx={{
              fontSize: "0.625rem",
              fontWeight: "bold",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
              color: "text.secondary",
              textTransform: "uppercase",
              height: 18,
              borderRadius: 1,
            }}
            data-component-semantics="Metadata badge"
          />
        )}
        {typeof ths.progress === "number" && (
          <Chip
            label={ths.progress === 100 ? "Completed" : `${ths.progress}% Progress`}
            size="small"
            sx={{
              fontSize: "0.625rem",
              fontWeight: "bold",
              border: "1px solid",
              borderColor: ths.progress === 100 ? "success.main" : "warning.main",
              bgcolor: ths.progress === 100 ? "success.light" : "warning.light",
              color: ths.progress === 100 ? "success.dark" : "warning.dark",
              height: 18,
              borderRadius: 1,
            }}
            data-component-semantics="Status badge"
          />
        )}
      </Box>

      <Typography
        variant="h3"
        sx={{
          fontSize: "1.15rem",
          fontWeight: "bold",
          lineHeight: 1.3,
          mb: 2,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box
          component="span"
          className="thesis-card-title"
          sx={{
            color: "text.primary",
            transition: "color 0.2s",
          }}
        >
          {ths.title}
        </Box>
      </Typography>

      <Box
        sx={{
          fontSize: "0.75rem",
          bgcolor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2.5,
          p: 2,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
            Timeline:
          </Typography>
          <Typography variant="caption" sx={{ color: "text.primary" }}>
            {startYearStr} – {endYearStr}
          </Typography>
        </Box>

        {ths.student && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
              Student:
            </Typography>
            <Typography variant="caption" sx={{ color: "text.primary" }}>
              {ths.student}
            </Typography>
          </Box>
        )}

        {ths.director && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
              Director:
            </Typography>
            <Typography variant="caption" sx={{ color: "text.primary" }}>
              {ths.director}
            </Typography>
          </Box>
        )}

        {ths.coDirector && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
              Co-Director:
            </Typography>
            <Typography variant="caption" sx={{ color: "text.primary" }}>
              {ths.coDirector}
            </Typography>
          </Box>
        )}
      </Box>

      {ths.summary && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.5,
            mb: 2,
            position: "relative",
            zIndex: 2,
          }}
        >
          {ths.summary}
        </Typography>
      )}

      {typeof ths.progress === "number" && ths.progress < 100 && (
        <Box sx={{ mt: "auto", mb: 2, position: "relative", zIndex: 2 }}>
          <LinearProgress
            variant="determinate"
            value={ths.progress}
            color="secondary"
            sx={{ height: 4, borderRadius: 1 }}
          />
        </Box>
      )}

      {ths.tags.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            mt: typeof ths.progress === "number" && ths.progress < 100 ? 0 : "auto",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            position: "relative",
            zIndex: 4,
          }}
        >
          {ths.tags.slice(0, 4).map((tag: string, idx: number) => (
            <Link key={idx} href={`/tags/${tag}`} style={{ textDecoration: "none" }}>
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
          {ths.tags.length > 4 && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.625rem",
                fontWeight: "bold",
                color: "text.secondary",
                alignSelf: "center",
                ml: 0.5,
              }}
            >
              +{ths.tags.length - 4} more
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
}
