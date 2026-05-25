"use client";

import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { ScholarshipTrendDataPoint } from "@/app/reports/statistics/actions";

interface ScholarshipsGrantsChartProps {
  data: ScholarshipTrendDataPoint[];
}

export function ScholarshipsGrantsChart({ data }: ScholarshipsGrantsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card variant="outlined" sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
        <Typography color="text.secondary">No scholarship data available.</Typography>
      </Card>
    );
  }

  // Visual Palette matching LIFIA branding and premium dark/light rules
  const colors = [
    "#E56226", // LIFIA Secondary / Vibrant Orange (Doctoral)
    "#093A54", // LIFIA Primary / Deep Blue (Postdoctoral)
    "#7c3aed", // Soft Purple (Undergraduate)
    "#94a3b8", // Slate Gray (Other)
  ];

  return (
    <Card 
      component="section" 
      data-component-semantics="Scholarships and grants chart" 
      aria-labelledby="scholarships-chart-title"
      variant="outlined" 
      sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}
    >
      <CardContent 
        sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
          <Typography 
            id="scholarships-chart-title" 
            variant="h3" 
            component="h2" 
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Scholarships and Research Grants
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Evolution of the laboratory's active scholarship holders over the last 10 years.
          </Typography>
        </Box>

        {/* Visual Chart Representation */}
        <Box component="figure" sx={{ m: 0, width: "100%", height: 350, position: "relative" }}>
          <BarChart
            dataset={data as any}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "year",
                label: "Year",
                tickLabelStyle: {
                  fontSize: 11,
                  fill: "var(--mui-palette-text-secondary)",
                },
                labelStyle: {
                  fill: "var(--mui-palette-text-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                },
              },
            ]}
            yAxis={[
              {
                label: "Active Scholarships Count",
                labelStyle: {
                  fill: "var(--mui-palette-text-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                },
              },
            ]}
            series={[
              { dataKey: "doctoral", label: "Doctoral (PhD)", stack: "total" },
              { dataKey: "postdoctoral", label: "Postdoctoral", stack: "total" },
              { dataKey: "undergraduate", label: "Undergraduate / Grado", stack: "total" },
              { dataKey: "other", label: "Others", stack: "total" },
            ]}
            colors={colors}
            height={320}
            sx={{
              "& .MuiChartsLegend-label": {
                fill: "var(--mui-palette-text-primary) !important",
                fontSize: "11px !important",
              },
            }}
            margin={{ top: 20, right: 20, left: 50, bottom: 40 }}
          />
          <figcaption style={{ display: "none" }}>
            Stacked bar chart showing the active scholarship holders in the laboratory over time, split by Doctoral (PhD) scholarships, Postdoctoral scholarships, Undergraduate / Grado scholarships, and other categories.
          </figcaption>
        </Box>

        {/* Semantic/Accessible Data Discloser */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <details style={{ cursor: "pointer" }}>
            <summary style={{ fontSize: "0.815rem", fontWeight: 700, color: "var(--mui-palette-primary-main)", userSelect: "none" }}>
              View Tabular Data (Screen-Reader Friendly)
            </summary>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, maxHeight: 200, borderRadius: 2 }}>
              <Table size="small" aria-label="Scholarships and Research Grants data table">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Doctoral (PhD)</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Postdoctoral</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Undergraduate / Grado</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Others</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.year} hover>
                      <TableCell sx={{ fontWeight: "bold" }}>{row.year}</TableCell>
                      <TableCell>{row.doctoral}</TableCell>
                      <TableCell>{row.postdoctoral}</TableCell>
                      <TableCell>{row.undergraduate}</TableCell>
                      <TableCell>{row.other}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </details>
        </Box>
      </CardContent>
    </Card>
  );
}
