"use client";

import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
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
import { DistributionDataPoint } from "@/lib/services/statisticsService";

interface FundingAgencyChartProps {
  data: DistributionDataPoint[];
}

export function FundingAgencyChart({ data }: FundingAgencyChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card variant="outlined" sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
        <Typography color="text.secondary">No funding agency data available.</Typography>
      </Card>
    );
  }

  // Map to the PieChart data format
  const seriesData = data.map((item, index) => ({
    id: index,
    value: item.value,
    label: item.label,
  }));

  // Visual palette
  const colors = [
    "#093A54", // LIFIA Primary / Deep Indigo
    "#E56226", // LIFIA Secondary / Orange
    "#7c3aed", // Soft Purple
    "#2e7d32", // Success Green
    "#10b981", // Emerald Teal
    "#f59e0b", // Amber Yellow
    "#94a3b8", // Slate Gray
  ];

  return (
    <Card 
      component="section" 
      data-component-semantics="Funding agency chart" 
      aria-labelledby="funding-chart-title"
      variant="outlined" 
      sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}
    >
      <CardContent 
        sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
          <Typography 
            id="funding-chart-title" 
            variant="h3" 
            component="h2" 
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Funding Agency Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Proportion of active research projects sponsored by different science and education funding agencies.
          </Typography>
        </Box>

        {/* Visual Chart Representation */}
        <Box component="figure" sx={{ m: 0, width: "100%", height: 350, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <PieChart
            series={[
              {
                data: seriesData,
                innerRadius: 50,
                outerRadius: 100,
                paddingAngle: 3,
                cornerRadius: 5,
                cx: 140, // center on the left, leaving right for legends
              },
            ]}
            colors={colors}
            height={280}
            slotProps={{
              legend: {
                direction: "column" as any,
                position: { vertical: "middle", horizontal: "right" },
              },
            } as any}
            sx={{
              "& .MuiChartsLegend-label": {
                fill: "var(--mui-palette-text-primary) !important",
                fontSize: "11px !important",
              },
            }}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          />
          <figcaption style={{ display: "none" }}>
            Doughnut chart displaying the distribution of funding sponsors among active projects (e.g. UNLP, CONICET, CIC, ANPCyT).
          </figcaption>
        </Box>

        {/* Accessible Data Table */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <details style={{ cursor: "pointer" }}>
            <summary style={{ fontSize: "0.815rem", fontWeight: 700, color: "var(--mui-palette-primary-main)", userSelect: "none" }}>
              View Tabular Data (Screen-Reader Friendly)
            </summary>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, maxHeight: 200, borderRadius: 2 }}>
              <Table size="small" aria-label="Funding Agency Distribution data table">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Funding Agency</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Active Projects Sponsor Count</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Proportion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => {
                    const total = data.reduce((sum, item) => sum + item.value, 0);
                    const percent = total > 0 ? ((row.value / total) * 100).toFixed(1) : "0";
                    return (
                      <TableRow key={row.label} hover>
                        <TableCell sx={{ fontWeight: "bold" }}>{row.label}</TableCell>
                        <TableCell>{row.value}</TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>{percent}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </details>
        </Box>
      </CardContent>
    </Card>
  );
}
