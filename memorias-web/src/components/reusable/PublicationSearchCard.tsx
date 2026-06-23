import React from "react";
import Link from "next/link";
import { Card, Box, Chip, Button } from "@mui/material";
import { formatCitation } from "@/lib/citations";
import { jsonToBibtex } from "@/lib/bibtex";
import { CopyCitationButton } from "@/app/publications/CopyCitationButton";

interface PublicationSearchCardProps {
  publication: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function PublicationSearchCard({ publication: pb }: PublicationSearchCardProps) {
  const citation = formatCitation(pb, "apa");
  const bibString = jsonToBibtex(pb);
  const bibDownloadUrl = bibString
    ? `data:text/plain;charset=utf-8,${encodeURIComponent(bibString)}`
    : null;

  return (
    <Card
      data-component-semantics="Publication search result card"
      sx={{
        width: "100%",
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
        href={`/publications/${pb.slug}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
        }}
      />
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            fontSize: "0.9rem",
            lineHeight: 1.6,
            color: "text.primary",
            position: "relative",
            zIndex: 2,
            "& a": {
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            },
          }}
          dangerouslySetInnerHTML={{ __html: citation.html }}
        />

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pt: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            position: "relative",
            zIndex: 4,
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
            <Chip
              label={pb.type}
              size="small"
              sx={{
                fontWeight: "bold",
                fontSize: "0.625rem",
                height: 18,
                borderRadius: 1,
                textTransform: "uppercase",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "action.hover",
                color: "text.secondary",
              }}
              data-component-semantics="Metadata badge"
            />
            {pb.ranking && (
              <Chip
                label={`Ranking: ${pb.ranking}`}
                size="small"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.625rem",
                  height: 18,
                  borderRadius: 1,
                  textTransform: "uppercase",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                  color: "text.secondary",
                }}
                data-component-semantics="Metadata badge"
              />
            )}
            {pb.tags.map((tag: string) => (
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

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
            {pb.selfArchivingUrl && (
              <Button
                component="a"
                href={pb.selfArchivingUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  fontSize: "0.625rem",
                  fontWeight: 750,
                  py: 0.25,
                  px: 1,
                  height: 24,
                  borderRadius: 1.5,
                  position: "relative",
                  zIndex: 4,
                }}
              >
                PDF
              </Button>
            )}

            {bibDownloadUrl && (
              <Button
                component="a"
                href={bibDownloadUrl}
                download={`${pb.slug || "citation"}.bib`}
                size="small"
                color="inherit"
                sx={{
                  fontSize: "0.625rem",
                  fontWeight: 750,
                  py: 0.25,
                  px: 1,
                  height: 24,
                  borderRadius: 1.5,
                  color: "text.secondary",
                  borderColor: "divider",
                  border: "1px solid",
                  "&:hover": { bgcolor: "action.hover", borderColor: "text.primary" },
                  position: "relative",
                  zIndex: 4,
                }}
              >
                BibTeX
              </Button>
            )}

            <Box sx={{ position: "relative", zIndex: 4 }}>
              <CopyCitationButton textToCopy={citation.text} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
