"use client";

import React from "react";
import { Box, Card, Typography, CircularProgress } from "@mui/material";
import { Block, buildProjectSentence, buildScholarshipSentence, buildThesisSentence } from "./useReportCompiler";

interface ReportPreviewCanvasProps {
  blocks: Block[];
  reportTitle: string;
  isCompiling: boolean;
  hidePaperHeaders?: boolean;
}

export function ReportPreviewCanvas({
  blocks,
  reportTitle,
  isCompiling,
  hidePaperHeaders = false,
}: ReportPreviewCanvasProps) {
  
  const renderMarkdownText = (text: string) => {
    return text.split("\n").map((line, index) => {
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      if (formattedLine.startsWith("# ")) {
        return (
          <Typography
            key={index}
            variant="h4"
            sx={{ fontWeight: 800, mt: 3, mb: 1.5, borderBottom: "2px solid", borderColor: "grey.200", pb: 0.5, color: "text.primary" }}
          >
            {formattedLine.replace("# ", "")}
          </Typography>
        );
      } else if (formattedLine.startsWith("## ")) {
        return (
          <Typography
            key={index}
            variant="h5"
            sx={{ fontWeight: 700, mt: 2.5, mb: 1, borderBottom: "1px solid", borderColor: "grey.200", pb: 0.5, color: "text.primary" }}
          >
            {formattedLine.replace("## ", "")}
          </Typography>
        );
      } else if (formattedLine.startsWith("### ")) {
        return (
          <Typography
            key={index}
            variant="h6"
            sx={{ fontWeight: 600, mt: 2, mb: 1, color: "text.primary" }}
          >
            {formattedLine.replace("### ", "")}
          </Typography>
        );
      } else if (formattedLine.startsWith("- ") || formattedLine.startsWith("* ")) {
        return (
          <Typography
            key={index}
            component="li"
            variant="body2"
            sx={{ ml: 3, mb: 0.5, listStyleType: "disc", color: "text.primary" }}
            dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }}
          />
        );
      }
      return formattedLine.trim() ? (
        <Typography
          key={index}
          variant="body2"
          sx={{ mb: 1.5, lineHeight: 1.6, color: "text.primary" }}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      ) : (
        <Box key={index} sx={{ height: 8 }} />
      );
    });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        bgcolor: "background.paper",
        borderColor: "divider",
        boxShadow: 3,
        borderRadius: 4,
        p: 4,
        minHeight: 600,
        overflowY: "auto",
        width: "100%",
        maxWidth: 800,
        "@media print": {
          boxShadow: "none",
          border: "none",
          p: 0,
          m: 0,
        }
      }}
    >
      {!hidePaperHeaders && (
        <Box sx={{ borderBottom: "2px solid", borderColor: "divider", pb: 2, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: "bold", tracking: "0.1em", color: "text.secondary", display: "block" }}>
              Report Preview
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {reportTitle || "Untitled Report"}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
              Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </Typography>
          </Box>
        </Box>
      )}

      {isCompiling && (
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, zIndex: 30, borderRadius: 4 }}>
          <CircularProgress size={32} />
          <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.primary" }}>
            Compiling Report Preview...
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {blocks.map((block) => {
          if (block.type === "markdown" || block.type === "genai") {
            return (
              <Box key={block.id} sx={{ position: "relative", color: "text.primary" }}>
                {block.type === "genai" && block.isGenerating && (
                  <Box sx={{ p: 2.5, border: "1px dashed", borderColor: "primary.main", borderRadius: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "action.hover", mb: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" sx={{ fontWeight: "bold" }} color="primary.main">
                      GenAI Block: Compiling AI summary...
                    </Typography>
                  </Box>
                )}
                {renderMarkdownText(block.content || "")}
              </Box>
            );
          }

          if (block.type === "publications") {
            return (
              <Box key={block.id} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {block.compiledItems.length === 0 ? (
                  <Typography variant="body2" sx={{ fontStyle: "italic" }} color="text.secondary">
                    No publications matched your filters.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {block.compiledItems.map((pub, i) => (
                      <Typography
                        key={pub.id || i}
                        variant="body2"
                        sx={{ lineHeight: 1.6, color: "text.primary" }}
                        dangerouslySetInnerHTML={{ __html: pub.citationHtml }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            );
          }

          if (block.type === "projects") {
            return (
              <Box key={block.id} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {block.compiledItems.length === 0 ? (
                  <Typography variant="body2" sx={{ fontStyle: "italic" }} color="text.secondary">
                    No projects matched your filters.
                  </Typography>
                ) : (
                  block.compiledItems.map((proj, i) => (
                    <Box key={proj.id || i} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                        {proj.title} {proj.code ? `(Code: ${proj.code})` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {buildProjectSentence(proj)}
                      </Typography>
                      {block.filters.showSummary && proj.summary && (
                        <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }} color="text.secondary">
                          Summary: {proj.summary}
                        </Typography>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            );
          }

          if (block.type === "scholarships") {
            return (
              <Box key={block.id} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {block.compiledItems.length === 0 ? (
                  <Typography variant="body2" sx={{ fontStyle: "italic" }} color="text.secondary">
                    No scholarships matched your filters.
                  </Typography>
                ) : (
                  block.compiledItems.map((schol, i) => (
                    <Box key={schol.id || i} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                        {schol.title} {schol.type ? `(${schol.type})` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {buildScholarshipSentence(schol)}
                      </Typography>
                      {block.filters.showSummary && schol.summary && (
                        <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }} color="text.secondary">
                          Summary: {schol.summary}
                        </Typography>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            );
          }

          if (block.type === "theses") {
            return (
              <Box key={block.id} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {block.compiledItems.length === 0 ? (
                  <Typography variant="body2" sx={{ fontStyle: "italic" }} color="text.secondary">
                    No theses matched your filters.
                  </Typography>
                ) : (
                  block.compiledItems.map((thesis, i) => (
                    <Box key={thesis.id || i} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                        {thesis.title} {thesis.level ? `(${thesis.level})` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {buildThesisSentence(thesis)}
                      </Typography>
                      {block.filters.showSummary && thesis.summary && (
                        <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }} color="text.secondary">
                          Summary: {thesis.summary}
                        </Typography>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            );
          }

          return null;
        })}
      </Box>
    </Card>
  );
}
