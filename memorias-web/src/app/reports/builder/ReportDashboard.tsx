"use client";

import React from "react";
import { Box, Card, Typography, Button, Grid, CircularProgress } from "@mui/material";

interface ReportDashboardProps {
  savedReports: any[];
  isLoadingReports: boolean;
  handleCreateNewReport: () => void;
  handleViewReport: (report: any) => void;
  handleEditReport: (report: any) => void;
  handleDeleteReport: (id: string) => void;
}

export function ReportDashboard({
  savedReports,
  isLoadingReports,
  handleCreateNewReport,
  handleViewReport,
  handleEditReport,
  handleDeleteReport,
}: ReportDashboardProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Typography variant="h2" sx={{ fontSize: "1.35rem", fontWeight: 800 }}>
          Saved Configs
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateNewReport}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 2.5,
            px: 3,
          }}
        >
          Create New Report
        </Button>
      </Box>

      {isLoadingReports ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
            Loading reports...
          </Typography>
        </Box>
      ) : savedReports.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: "center", maxWidth: 500, mx: "auto", borderRadius: 4, bgcolor: "background.paper", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, color: "text.primary" }}>
            No reports found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You have no saved report configurations yet. Click below to compose your first custom research summary.
          </Typography>
          <Button variant="contained" onClick={handleCreateNewReport} sx={{ textTransform: "none", fontWeight: "bold" }}>
            Compose Report
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {savedReports.map((report) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: 3, borderRadius: 3, bgcolor: "background.paper", borderColor: "divider" }} variant="outlined">
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    onClick={() => handleViewReport(report)}
                    sx={{ fontWeight: "bold", cursor: "pointer", "&:hover": { color: "primary.main" }, mb: 1.5, color: "text.primary", lineHeight: 1.4 }}
                  >
                    {report.title}
                  </Typography>
                  <Box sx={{ fontFamily: "monospace", display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Modified: {new Date(report.updatedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Blocks: {Array.isArray(report.blocks) ? report.blocks.length : 0}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                  <Button size="small" variant="outlined" onClick={() => handleViewReport(report)} sx={{ flex: 1, textTransform: "none", fontWeight: "bold" }}>
                    View
                  </Button>
                  <Button size="small" variant="contained" onClick={() => handleEditReport(report)} sx={{ flex: 1, textTransform: "none", fontWeight: "bold" }}>
                    Edit
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteReport(report.id)} sx={{ textTransform: "none", fontWeight: "bold" }}>
                    Delete
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
