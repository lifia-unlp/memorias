"use client";

import React from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { useReportCompiler } from "./useReportCompiler";
import { ReportDashboard } from "./ReportDashboard";
import { ReportPreviewCanvas } from "./ReportPreviewCanvas";
import { ReportBlockEditor } from "./ReportBlockEditor";

export default function ReportBuilderClient({ userRole }: { userRole?: string }) {
  const {
    initData,
    blocks,
    isCompiling,
    viewState,
    setViewState,
    savedReports,
    reportId,
    reportTitle,
    setReportTitle,
    isLoadingReports,
    cancelGenAIUpdate,
    handleSaveReport,
    handleEditReport,
    handleCreateNewReport,
    handleViewReport,
    handleDeleteReport,
    isGenAIDirty,
    getSelectedContextLength,
    compileReport,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlockContent,
    updateBlockFilter,
    updateBlockSort,
    exportMarkdown,
    handlePrint,
  } = useReportCompiler();

  // 1. DASHBOARD LIST MODE
  if (viewState === "list") {
    return (
      <ReportDashboard
        savedReports={savedReports}
        isLoadingReports={isLoadingReports}
        handleCreateNewReport={handleCreateNewReport}
        handleViewReport={handleViewReport}
        handleEditReport={handleEditReport}
        handleDeleteReport={handleDeleteReport}
      />
    );
  }

  // 2. FULL SCREEN VIEW MODE
  if (viewState === "view") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Reader menu */}
        <Card sx={{ p: 2.5, borderRadius: 3, display: "flex", flexWrap: "wrap", alignItems: "center", justify: "space-between", gap: 2, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {reportTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Distraction-Free View Mode
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => setViewState("list")} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Back to List
            </Button>
            <Button variant="outlined" onClick={() => handleEditReport({ id: reportId, title: reportTitle, blocks })} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Edit Config
            </Button>
            <Button variant="outlined" onClick={exportMarkdown} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Export Markdown
            </Button>
            <Button variant="contained" color="secondary" onClick={handlePrint} sx={{ textTransform: "none", fontWeight: "bold" }}>
              Print to PDF
            </Button>
          </Box>
        </Card>

        {/* Centered Document Sheet */}
        <Box sx={{ display: "flex", justifyContent: "center", py: 4, bgcolor: "action.hover", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <ReportPreviewCanvas
            blocks={blocks}
            reportTitle={reportTitle}
            isCompiling={isCompiling}
            hidePaperHeaders={true}
          />
        </Box>
      </Box>
    );
  }

  // 3. EDITOR CANVA MODE
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Title Input & Actions Panel */}
      <Card sx={{ p: 3, borderRadius: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 3, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
        <Box sx={{ flex: 1, width: "100%" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
            Report Title Configuration
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Report Title"
            sx={{ bgcolor: "background.default" }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", md: "auto" }, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setViewState("list")} sx={{ textTransform: "none", fontWeight: "bold" }}>
            Back to List
          </Button>
          <Button variant="contained" onClick={handleSaveReport} sx={{ textTransform: "none", fontWeight: "bold" }}>
            Save Report
          </Button>
          {reportId && (
            <Button variant="contained" color="secondary" onClick={() => handleViewReport({ id: reportId, title: reportTitle, blocks })} sx={{ textTransform: "none", fontWeight: "bold" }}>
              View Full Screen
            </Button>
          )}
        </Box>
      </Card>
      
      {/* Builder Workspace Layout */}
      <Grid container spacing={4} sx={{ alignItems: "start" }}>
        
        {/* LEFT: Builder & Editor (7 Columns) */}
        <Grid size={{ xs: 12, lg: 7 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          
          {/* Element Palette */}
          <Card sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", mb: 2, display: "block" }}>
              Add Elements to Report
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[
                { label: "Markdown Block", type: "markdown" },
                { label: "Publications Block", type: "publications" },
                { label: "Projects Block", type: "projects" },
                { label: "Scholarships Block", type: "scholarships" },
                { label: "Thesis Block", type: "theses" },
                { label: "GenAI Block", type: "genai" },
              ].filter((item) => {
                if (item.type === "genai") {
                  return userRole === "ADMIN" || userRole === "POWER_EDITOR";
                }
                return true;
              }).map((item) => (
                <Button
                  key={item.type}
                  variant="outlined"
                  size="small"
                  onClick={() => addBlock(item.type as any)}
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Card>

          {/* Blocks Configuration Panel */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {blocks.length === 0 ? (
              <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderStyle: "dashed", borderColor: "divider", bgcolor: "background.paper" }}>
                <Typography variant="body2" color="text.secondary">
                  Your report has no elements. Add an element from the palette above to build your report.
                </Typography>
              </Card>
            ) : (
              blocks.map((block, index) => (
                <ReportBlockEditor
                  key={block.id}
                  block={block}
                  index={index}
                  totalBlocks={blocks.length}
                  initData={initData}
                  blocks={blocks}
                  userRole={userRole}
                  moveBlock={moveBlock}
                  removeBlock={removeBlock}
                  updateBlockContent={updateBlockContent}
                  updateBlockFilter={updateBlockFilter}
                  updateBlockSort={updateBlockSort}
                  compileReport={compileReport}
                  cancelGenAIUpdate={cancelGenAIUpdate}
                  isGenAIDirty={isGenAIDirty}
                  getSelectedContextLength={getSelectedContextLength}
                />
              ))
            )}
          </Box>

        </Grid>

        {/* RIGHT: Live Preview (5 Columns) */}
        <Grid size={{ xs: 12, lg: 5 }} sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
          <ReportPreviewCanvas
            blocks={blocks}
            reportTitle={reportTitle}
            isCompiling={isCompiling}
          />
        </Grid>

      </Grid>
    </Box>
  );
}
