"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
} from "@mui/material";
import { formatCitation, SUPPORTED_STYLES } from "@/lib/citations";
import { jsonToBibtex } from "@/lib/bibtex";
import { CopyCitationButton } from "@/app/publications/CopyCitationButton";

interface PublicationData {
  id: string;
  slug: string;
  type: string;
  title: string;
  authors: string;
  year: number;
  ranking: string | null;
  selfArchivingUrl: string | null;
  bibtexData: any;
  tags: string[];
}

interface RelatedPublicationsProps {
  publications: PublicationData[];
}

export function RelatedPublications({ publications }: RelatedPublicationsProps) {
  const [style, setStyle] = useState("apa");

  if (!publications || publications.length === 0) return null;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header and Style Selector */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: "1.15rem",
            fontWeight: 700,
          }}
        >
          Related Publications
        </Typography>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 650,
              height: 28,
              borderRadius: 1.5,
            }}
          >
            {SUPPORTED_STYLES.map((st) => (
              <MenuItem key={st.value} value={st.value} sx={{ fontSize: "0.75rem" }}>
                {st.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Publications Grid */}
      <Grid container spacing={2}>
        {publications.map((pb) => {
          const citation = formatCitation(pb, style);
          const bibString = jsonToBibtex(pb);
          const bibDownloadUrl = bibString
            ? `data:text/plain;charset=utf-8,${encodeURIComponent(bibString)}`
            : null;

          return (
            <Grid size={{ xs: 12 }} key={pb.id}>
              <Card sx={{ width: "100%" }}>
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  {/* Dynamic HTML Citation */}
                  <Box
                    sx={{
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                      color: "text.primary",
                      mb: 2,
                      "& a": {
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: citation.html }}
                  />

                  {/* Metadata Indicators & Action Row */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    {/* Chips for Type, Ranking, Tags */}
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
                          label={pb.ranking}
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
                      {pb.tags.map((tag) => (
                        <Chip
                          key={tag}
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
                          }}
                          data-component-semantics="Tag badge"
                        />
                      ))}
                    </Box>

                    {/* Action Buttons */}
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
                          }}
                        >
                          BibTeX
                        </Button>
                      )}

                      <Button
                        component={Link}
                        href={`/publications/${pb.slug}`}
                        size="small"
                        color="secondary"
                        sx={{
                          fontSize: "0.625rem",
                          fontWeight: 750,
                          py: 0.25,
                          px: 1,
                          height: 24,
                          borderRadius: 1.5,
                        }}
                      >
                        Details
                      </Button>

                      <CopyCitationButton textToCopy={citation.text} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
