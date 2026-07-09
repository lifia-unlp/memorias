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
import { ProductionDataPoint } from "@/lib/services/statisticsService";

interface YearlyProductionChartProps {
  data: ProductionDataPoint[];
}

export function YearlyProductionChart({ data }: YearlyProductionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card variant="outlined" sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
        <Typography color="text.secondary">No publication data available.</Typography>
      </Card>
    );
  }

  // Visual Palette matching LIFIA branding and premium dark/light rules
  const colors = [
    "#093A54", // LIFIA Primary / Deep Indigo
    "#E56226", // LIFIA Secondary / Vibrant Orange
    "#7c3aed", // Soft Purple
    "#2e7d32", // Success Green
    "#94a3b8", // Slate Gray
  ];

  return (
    <Card 
      component="section" 
      data-component-semantics="Scientific production chart" 
      aria-labelledby="yearly-production-chart-title"
      variant="outlined" 
      sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}
    >
      <CardContent 
        sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
          <Typography 
            id="yearly-production-chart-title" 
            variant="h3" 
            component="h2" 
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Yearly Scientific Production Trends
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Evolution of the laboratory's publications categorized by scientific output type.
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
                label: "Publications Count",
                labelStyle: {
                  fill: "var(--mui-palette-text-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                },
              },
            ]}
            series={[
              { dataKey: "article", label: "Journal Articles", stack: "total" },
              { dataKey: "inproceedings", label: "Conference Papers", stack: "total" },
              { dataKey: "book", label: "Books / Chapters", stack: "total" },
              { dataKey: "thesis", label: "Theses", stack: "total" },
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
            Stacked bar chart showing the laboratory's scientific publications per year, split by Journal Articles, Conference Papers, Books and Chapters, Theses, and other publications.
          </figcaption>
        </Box>

        {/* Semantic/Accessible Data Discloser */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <details style={{ cursor: "pointer" }}>
            <summary style={{ fontSize: "0.815rem", fontWeight: 700, color: "var(--mui-palette-primary-main)", userSelect: "none" }}>
              View Tabular Data (Screen-Reader Friendly)
            </summary>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, maxHeight: 200, borderRadius: 2 }}>
              <Table size="small" aria-label="Yearly Scientific Production data table">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Journal Articles</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Conference Papers</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Books / Chapters</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Theses</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Others</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.year} hover>
                      <TableCell sx={{ fontWeight: "bold" }}>{row.year}</TableCell>
                      <TableCell>{row.article}</TableCell>
                      <TableCell>{row.inproceedings}</TableCell>
                      <TableCell>{row.book}</TableCell>
                      <TableCell>{row.thesis}</TableCell>
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
