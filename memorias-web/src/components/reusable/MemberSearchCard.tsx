import React from "react";
import Link from "next/link";
import { Card, Box, Avatar, Typography, Chip } from "@mui/material";

interface MemberSearchCardProps {
  member: {
    firstName: string;
    lastName: string;
    slug: string;
    avatarUrl?: string | null;
    positionAtLab?: string | null;
    highestDegree?: string | null;
    positionAtCONICET?: string | null;
    institutionalEmail?: string | null;
    tags: string[];
  };
}

export function MemberSearchCard({ member: m }: MemberSearchCardProps) {
  return (
    <Card
      data-component-semantics="Member search result card"
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
      }}
    >
      <Link
        href={`/members/${m.slug}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, position: "relative", zIndex: 2 }}>
        <Avatar
          src={m.avatarUrl || undefined}
          alt={`${m.firstName} ${m.lastName}`}
          sx={{
            width: 56,
            height: 56,
            bgcolor: "primary.light",
            color: "primary.main",
            fontWeight: "bold",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {!m.avatarUrl && `${m.firstName[0]}${m.lastName[0]}`}
        </Avatar>
        <Box sx={{ overflow: "hidden" }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: "1.05rem",
              fontWeight: "bold",
              mb: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              "&:hover": { color: "primary.main" },
              transition: "color 0.2s",
            }}
          >
            {m.firstName} {m.lastName}
          </Typography>
          {m.positionAtLab && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: "secondary.main",
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "block",
              }}
            >
              {m.positionAtLab}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          fontSize: "0.75rem",
          borderTop: "1px solid",
          borderColor: "divider",
          pt: 2,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          position: "relative",
          zIndex: 2,
        }}
      >
        {m.highestDegree && (
          <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
              Degree:
            </Typography>
            <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m.highestDegree}
            </Typography>
          </Box>
        )}
        {m.positionAtCONICET && (
          <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
              CONICET:
            </Typography>
            <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m.positionAtCONICET}
            </Typography>
          </Box>
        )}
        {m.institutionalEmail && (
          <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
              Email:
            </Typography>
            <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "primary.main" }}>
              {m.institutionalEmail}
            </Typography>
          </Box>
        )}
      </Box>

      {m.tags.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            mt: "auto",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            position: "relative",
            zIndex: 4,
          }}
        >
          {m.tags.slice(0, 3).map((tag: string, idx: number) => (
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
          {m.tags.length > 3 && (
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
              +{m.tags.length - 3} more
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
}
