"use client";

import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DistributionDataPoint } from "@/app/reports/statistics/actions";

interface QualificationsSeniorityChartProps {
  data: {
    degrees: DistributionDataPoint[];
    positions: DistributionDataPoint[];
  };
}

export function QualificationsSeniorityChart({ data }: QualificationsSeniorityChartProps) {
  const { degrees, positions } = data;
  
  const hasDegrees = degrees && degrees.length > 0;
  const hasPositions = positions && positions.length > 0;

  if (!hasDegrees && !hasPositions) {
    return (
      <Card variant="outlined" sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
        <Typography color="text.secondary">No members data available.</Typography>
      </Card>
    );
  }

  return (
    <Card 
      component="section" 
      data-component-semantics="Qualifications and seniority chart" 
      aria-labelledby="qualifications-chart-title"
      variant="outlined" 
      sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}
    >
      <CardContent 
        sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
          <Typography 
            id="qualifications-chart-title" 
            variant="h3" 
            component="h2" 
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Academic Qualifications and Seniority of Active Members
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Breakdown of active laboratory members grouped by highest degree achieved and position held.
          </Typography>
        </Box>

        {/* Side-by-Side Charts Layout */}
        <Grid container spacing={4} sx={{ flex: 1, minHeight: 300 }}>
          {/* Degrees Bar Chart */}
          <Grid size={{ xs: 12, md: 6 }} component="figure" sx={{ m: 0, display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", textAlign: "center" }}>
              Highest Academic Degree
            </Typography>
            {hasDegrees ? (
              <Box sx={{ width: "100%", height: 340 }}>
                <BarChart
                  dataset={degrees as any}
                  yAxis={[
                    { 
                      scaleType: "band", 
                      dataKey: "label",
                      width: 180,
                      categoryGapRatio: 0.4,
                      tickLabelStyle: {
                        fontSize: 10,
                        fill: "var(--mui-palette-text-secondary)",
                      }
                    }
                  ]}
                  xAxis={[
                    { 
                      label: "Member Count",
                      labelStyle: {
                        fill: "var(--mui-palette-text-primary)",
                        fontSize: 11,
                        fontWeight: 600,
                      },
                      tickLabelStyle: {
                        fontSize: 10,
                        fill: "var(--mui-palette-text-secondary)",
                      }
                    }
                  ]}
                  series={[{ dataKey: "value", color: "#093A54" }]}
                  layout="horizontal"
                  height={320}
                  margin={{ left: 200, right: 20, top: 15, bottom: 40 }}
                />
              </Box>
            ) : (
              <Box sx={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="text.secondary" variant="body2">No degree data.</Typography>
              </Box>
            )}
            <figcaption style={{ display: "none" }}>
              Horizontal bar chart showing the count of active lab members by their highest degree (e.g. Doctor, Magister, Graduate).
            </figcaption>
          </Grid>

          {/* Positions Bar Chart */}
          <Grid size={{ xs: 12, md: 6 }} component="figure" sx={{ m: 0, display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", textAlign: "center" }}>
              Lab Position / Role
            </Typography>
            {hasPositions ? (
              <Box sx={{ width: "100%", height: 340 }}>
                <BarChart
                  dataset={positions as any}
                  yAxis={[
                    { 
                      scaleType: "band", 
                      dataKey: "label",
                      width: 180,
                      categoryGapRatio: 0.4,
                      tickLabelStyle: {
                        fontSize: 10,
                        fill: "var(--mui-palette-text-secondary)",
                      }
                    }
                  ]}
                  xAxis={[
                    { 
                      label: "Member Count",
                      labelStyle: {
                        fill: "var(--mui-palette-text-primary)",
                        fontSize: 11,
                        fontWeight: 600,
                      },
                      tickLabelStyle: {
                        fontSize: 10,
                        fill: "var(--mui-palette-text-secondary)",
                      }
                    }
                  ]}
                  series={[{ dataKey: "value", color: "#E56226" }]}
                  layout="horizontal"
                  height={320}
                  margin={{ left: 200, right: 20, top: 15, bottom: 40 }}
                />
              </Box>
            ) : (
              <Box sx={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="text.secondary" variant="body2">No position data.</Typography>
              </Box>
            )}
            <figcaption style={{ display: "none" }}>
              Horizontal bar chart showing the count of active lab members by their position at the lab (e.g. Director, Researcher, Becario, etc.).
            </figcaption>
          </Grid>
        </Grid>

        {/* Semantic/Accessible Data Discloser */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <details style={{ cursor: "pointer" }}>
            <summary style={{ fontSize: "0.815rem", fontWeight: 700, color: "var(--mui-palette-primary-main)", userSelect: "none" }}>
              View Tabular Data (Screen-Reader Friendly)
            </summary>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {/* Degrees Table */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, borderRadius: 2 }}>
                  <Table size="small" aria-label="Highest Academic Degrees data table">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Highest Degree</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Active Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {degrees.map((row) => (
                        <TableRow key={row.label} hover>
                          <TableCell sx={{ fontWeight: "bold" }}>{row.label}</TableCell>
                          <TableCell>{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Positions Table */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, borderRadius: 2 }}>
                  <Table size="small" aria-label="Lab Positions data table">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Position at Lab</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Active Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {positions.map((row) => (
                        <TableRow key={row.label} hover>
                          <TableCell sx={{ fontWeight: "bold" }}>{row.label}</TableCell>
                          <TableCell>{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </details>
        </Box>
      </CardContent>
    </Card>
  );
}
