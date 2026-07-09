"use client";

import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { StatisticsData } from "@/lib/services/statisticsService";
import { YearlyProductionChart } from "./YearlyProductionChart";
import { ScholarshipsGrantsChart } from "./ScholarshipsGrantsChart";
import { QualificationsSeniorityChart } from "./QualificationsSeniorityChart";
import { ActiveProjectsChart } from "./ActiveProjectsChart";
import { FundingAgencyChart } from "./FundingAgencyChart";

interface StatisticsDashboardProps {
  data: StatisticsData;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `statistics-tab-${index}`,
    "aria-controls": `statistics-tabpanel-${index}`,
  };
}

export function StatisticsDashboard({ data }: StatisticsDashboardProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const { summary } = data;

  // Premium KPI cards definition (No emojis)
  const kpis = [
    {
      title: "Active Lab Members",
      value: summary.totalMembers,
      subtitle: "Researchers and students",
      borderColor: "#2e7d32",
    },
    {
      title: "Active Projects",
      value: summary.activeProjects,
      subtitle: "Ongoing research grants",
      borderColor: "#E56226",
    },
    {
      title: "Active Theses",
      value: summary.activeTheses,
      subtitle: "Undergraduate and graduate theses",
      borderColor: "#0288d1",
    },
    {
      title: "Active Scholarships",
      value: summary.activeScholarships,
      subtitle: "Funded junior researchers",
      borderColor: "#7c3aed",
    },
    {
      title: "Recent Publications",
      value: summary.recentPublications,
      subtitle: "In the last 3 years",
      borderColor: "#093A54",
    },
  ];

  return (
    <Box 
      data-component-semantics="Statistics dashboard"
      sx={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}
    >
      {/* KPI Stats Summary Section */}
      <Grid container spacing={3}>
        {kpis.map((kpi, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={idx}>
            <Card
              variant="outlined"
              sx={{
                position: "relative",
                overflow: "hidden",
                borderLeft: "6px solid",
                borderLeftColor: kpi.borderColor,
                bgcolor: "background.paper",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <CardContent sx={{ py: 2.5, px: 3, "&:last-child": { pb: 2.5 } }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {kpi.title}
                </Typography>
                <Typography variant="h2" component="div" sx={{ fontWeight: 800, color: "text.primary", mt: 1, mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Navigation Tabs */}
      <Box sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 3, p: 1, border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="laboratory statistics navigation tabs"
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "0.875rem",
              px: 3,
              borderRadius: 2,
              minHeight: 48,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "action.hover",
              },
            },
            "& .Mui-selected": {
              color: "primary.main",
            },
          }}
        >
          <Tab label="Overview & People" {...a11yProps(0)} />
          <Tab label="Scientific Production" {...a11yProps(1)} />
          <Tab label="Projects & Scholarships" {...a11yProps(2)} />
        </Tabs>

        <Divider sx={{ mt: 1, opacity: 0.5 }} />

        {/* Tab 1: Overview & People */}
        <CustomTabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <QualificationsSeniorityChart data={data.qualifications} />
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Tab 2: Scientific Production */}
        <CustomTabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <YearlyProductionChart data={data.production} />
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Tab 3: Projects & Scholarships */}
        <CustomTabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ActiveProjectsChart data={data.activeProjects} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ScholarshipsGrantsChart data={data.scholarships} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FundingAgencyChart data={data.fundingAgencies} />
            </Grid>
          </Grid>
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
