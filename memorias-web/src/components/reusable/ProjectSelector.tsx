"use client";

import React from "react";
import { EntitySelector } from "./EntitySelector";
import { Box, Checkbox, Typography, ListItemText } from "@mui/material";

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

const sortProjects = (items: ProjectOption[]) => {
  return [...items].sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
    const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    const startA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const startB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return startB - startA;
  });
};

export function ProjectSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: ProjectSelectorProps) {
  return (
    <EntitySelector<ProjectOption>
      title="Related Projects"
      subtitle="Select research projects connected to this resource."
      searchPlaceholder="Search projects..."
      items={items}
      selectedIds={selectedIds}
      onChange={onChange}
      layout={layout}
      semanticsLabel="Related projects"
      getItemId={(p) => p.id}
      getSearchableFields={(p) => [p.title, p.code, p.director, p.coDirector]}
      sortItems={sortProjects}
      gridSizes={{ xs: 12, sm: 6 }}
      renderListItem={(proj, isChecked) => {
        const hasDetails = proj.director || proj.startDate || proj.endDate;
        const dateRange = (proj.startDate || proj.endDate) ? `${formatDate(proj.startDate)} - ${formatDate(proj.endDate)}` : "";
        const detailsText = `${proj.director ? `Dir: ${proj.director}` : ""}${proj.director && dateRange ? " | " : ""}${dateRange}`;
        return (
          <ListItemText
            primary={(proj.code ? `[${proj.code}] ` : "") + proj.title}
            secondary={hasDetails ? detailsText : undefined}
            slotProps={{
              primary: { sx: { fontSize: "0.75rem", fontWeight: isChecked ? "bold" : "normal" } },
              secondary: { sx: { fontSize: "0.65rem" } }
            }}
          />
        );
      }}
      renderItemDetails={(proj, isChecked, former, handleToggle) => {
        const hasDetails = proj.director || proj.startDate || proj.endDate;
        const dateRange = (proj.startDate || proj.endDate) ? `${formatDate(proj.startDate)} - ${formatDate(proj.endDate)}` : "";
        return (
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
            <Checkbox checked={isChecked} size="small" sx={{ p: 0.5 }} />
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
        );
      }}
    />
  );
}
