"use client";

import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
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
import { ActiveTrendDataPoint } from "@/app/reports/statistics/actions";

interface ActiveProjectsChartProps {
  data: ActiveTrendDataPoint[];
}

export function ActiveProjectsChart({ data }: ActiveProjectsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card variant="outlined" sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
        <Typography color="text.secondary">No project data available.</Typography>
      </Card>
    );
  }

  return (
    <Card 
      component="section" 
      data-component-semantics="Active projects chart" 
      aria-labelledby="active-projects-chart-title"
      variant="outlined" 
      sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}
    >
      <CardContent 
        sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
          <Typography 
            id="active-projects-chart-title" 
            variant="h3" 
            component="h2" 
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Active Projects Evolution
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Trend showing the total number of research and development projects active each year.
          </Typography>
        </Box>

        {/* Visual Chart Representation */}
        <Box component="figure" sx={{ m: 0, width: "100%", height: 350, position: "relative" }}>
          <LineChart
            dataset={data as any}
            xAxis={[
              {
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
                label: "Active Projects",
                labelStyle: {
                  fill: "var(--mui-palette-text-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                },
              },
            ]}
            series={[
              {
                dataKey: "count",
                label: "Active Projects Count",
                color: "#093A54", // LIFIA Primary / Deep Indigo
                area: true,
              },
            ]}
            height={320}
            margin={{ top: 20, right: 20, left: 50, bottom: 40 }}
          />
          <figcaption style={{ display: "none" }}>
            Line chart with filled area beneath, showing the number of active research projects in the laboratory per year.
          </figcaption>
        </Box>

        {/* Semantic/Accessible Data Discloser */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <details style={{ cursor: "pointer" }}>
            <summary style={{ fontSize: "0.815rem", fontWeight: 700, color: "var(--mui-palette-primary-main)", userSelect: "none" }}>
              View Tabular Data (Screen-Reader Friendly)
            </summary>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, maxHeight: 200, borderRadius: 2 }}>
              <Table size="small" aria-label="Active Projects Evolution data table">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Active Projects Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.year} hover>
                      <TableCell sx={{ fontWeight: "bold" }}>{row.year}</TableCell>
                      <TableCell>{row.count}</TableCell>
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
