"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Checkbox,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

interface ProjectOption {
  id: string;
  title: string;
  slug?: string;
  code?: string | null;
  director?: string | null;
  coDirector?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}

interface ProjectSelectorProps {
  items: ProjectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  layout?: "grid" | "list";
}

const formatDate = (d: any) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" });
};

export function ProjectSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: ProjectSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Sort descending by end date, then by start date
  const sortedItems = [...items].sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
    const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    const startA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const startB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return startB - startA;
  });

  const filteredItems = sortedItems.filter((item) =>
    `${item.title} ${item.code || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (layout === "list") {
    return (
      <Card data-component-semantics="Related projects" variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
            Related Projects
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1, bgcolor: "background.paper" }}>
            <List dense disablePadding>
              {filteredItems.map((p) => {
                const isChecked = selectedIds.includes(p.id);
                const hasDetails = p.director || p.startDate || p.endDate;
                const dateRange = (p.startDate || p.endDate) ? `${formatDate(p.startDate)} - ${formatDate(p.endDate)}` : "";
                const detailsText = `${p.director ? `Dir: ${p.director}` : ""}${p.director && dateRange ? " | " : ""}${dateRange}`;
                return (
                  <ListItemButton
                    key={p.id}
                    dense
                    onClick={() => handleToggle(p.id)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <Checkbox
                      edge="start"
                      checked={isChecked}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                      sx={{ p: 0.5 }}
                    />
                    <ListItemText
                      primary={(p.code ? `[${p.code}] ` : "") + p.title}
                      secondary={hasDetails ? detailsText : undefined}
                      slotProps={{
                        primary: { sx: { fontSize: "0.75rem", fontWeight: isChecked ? "bold" : "normal" } },
                        secondary: { sx: { fontSize: "0.65rem" } }
                      }}
                    />
                  </ListItemButton>
                );
              })}
              {filteredItems.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", py: 2 }}>
                  No projects found
                </Typography>
              )}
            </List>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-component-semantics="Related projects" variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyItems: "center", justifyContent: "between", alignItems: { xs: "stretch", md: "center" }, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
              Related Projects
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select research projects connected to this resource.
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: "100%", md: 260 } }}
          />
        </Box>

        {filteredItems.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 2 }}>
            No projects found.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
            <Grid container spacing={2}>
              {filteredItems.map((proj) => {
                const isChecked = selectedIds.includes(proj.id);
                const hasDetails = proj.director || proj.startDate || proj.endDate;
                const dateRange = (proj.startDate || proj.endDate) ? `${formatDate(proj.startDate)} - ${formatDate(proj.endDate)}` : "";
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={proj.id}>
                    <Box
                      onClick={() => handleToggle(proj.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: isChecked ? "primary.main" : "divider",
                        bgcolor: isChecked ? "action.selected" : "background.paper",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        size="small"
                        sx={{ p: 0.5 }}
                      />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
                          {proj.title}
                        </Typography>
                        {hasDetails && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.65rem" }}>
                            {proj.director ? `Dir: ${proj.director}${proj.coDirector ? ` / Co-Dir: ${proj.coDirector}` : ""}` : ""}
                            {proj.director && dateRange ? " | " : ""}
                            {dateRange}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
