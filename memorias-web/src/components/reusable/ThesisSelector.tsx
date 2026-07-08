"use client";

import React from "react";
import { EntitySelector } from "./EntitySelector";
import { Box, Checkbox, Typography, ListItemText } from "@mui/material";

interface ThesisOption {
  id: string;
  title: string;
  slug?: string;
  level?: string | null;
  student?: string | null;
  director?: string | null;
  coDirector?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}

interface ThesisSelectorProps {
  items: ThesisOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  layout?: "grid" | "list";
}

const sortTheses = (items: ThesisOption[]) => {
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

export function ThesisSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: ThesisSelectorProps) {
  return (
    <EntitySelector<ThesisOption>
      title="Related Theses"
      subtitle="Select associated theses."
      searchPlaceholder="Search theses..."
      items={items}
      selectedIds={selectedIds}
      onChange={onChange}
      layout={layout}
      semanticsLabel="Related theses"
      getItemId={(t) => t.id}
      getSearchableFields={(t) => [t.title, t.student, t.level, t.director, t.coDirector]}
      sortItems={sortTheses}
      gridSizes={{ xs: 12, sm: 6 }}
      renderListItem={(t, isChecked) => {
        const hasDetails = t.level || t.student || t.director;
        const detailsText = `${t.level || ""}${t.level && t.student ? " | " : ""}${t.student ? `Student: ${t.student}` : ""}${((t.level || t.student) && t.director) ? " | " : ""}${t.director ? `Dir: ${t.director}${t.coDirector ? ` / Co-Dir: ${t.coDirector}` : ""}` : ""}`;
        return (
          <ListItemText
            primary={t.title}
            secondary={hasDetails ? detailsText : undefined}
            slotProps={{
              primary: { sx: { fontSize: "0.75rem", fontWeight: isChecked ? "bold" : "normal" } },
              secondary: { sx: { fontSize: "0.65rem" } }
            }}
          />
        );
      }}
      renderItemDetails={(t, isChecked, former, handleToggle) => {
        const hasDetails = t.level || t.student || t.director;
        const detailsText = `${t.level || ""}${t.level && t.student ? " | " : ""}${t.student ? `Student: ${t.student}` : ""}${((t.level || t.student) && t.director) ? " | " : ""}${t.director ? `Dir: ${t.director}${t.coDirector ? ` / Co-Dir: ${t.coDirector}` : ""}` : ""}`;
        return (
          <Box
            onClick={() => handleToggle(t.id)}
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
                {t.title}
              </Typography>
              {hasDetails && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.65rem" }}>
                  {detailsText}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
    />
  );
}
