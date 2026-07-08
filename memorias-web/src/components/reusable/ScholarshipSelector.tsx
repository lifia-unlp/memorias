"use client";

import React from "react";
import { EntitySelector } from "./EntitySelector";
import { Box, Checkbox, Typography, ListItemText } from "@mui/material";

interface ScholarshipOption {
  id: string;
  title: string;
  slug?: string;
  type?: string | null;
  student?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}

interface ScholarshipSelectorProps {
  items: ScholarshipOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  layout?: "grid" | "list";
}

const formatDate = (d: any) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" });
};

const sortScholarships = (items: ScholarshipOption[]) => {
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

export function ScholarshipSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: ScholarshipSelectorProps) {
  return (
    <EntitySelector<ScholarshipOption>
      title="Related Scholarships"
      subtitle="Select associated scholarships."
      searchPlaceholder="Search scholarships..."
      items={items}
      selectedIds={selectedIds}
      onChange={onChange}
      layout={layout}
      semanticsLabel="Related scholarships"
      getItemId={(s) => s.id}
      getSearchableFields={(s) => [s.title, s.student, s.type]}
      sortItems={sortScholarships}
      gridSizes={{ xs: 12, sm: 6 }}
      renderListItem={(s, isChecked) => {
        const hasDetails = s.type || s.student || s.startDate || s.endDate;
        const dateRange = (s.startDate || s.endDate) ? `${formatDate(s.startDate)} - ${formatDate(s.endDate)}` : "";
        const detailsText = `${s.type || ""}${s.type && s.student ? " | " : ""}${s.student ? `Student: ${s.student}` : ""}${(s.type || s.student) && dateRange ? " | " : ""}${dateRange}`;
        return (
          <ListItemText
            primary={s.title}
            secondary={hasDetails ? detailsText : undefined}
            slotProps={{
              primary: { sx: { fontSize: "0.75rem", fontWeight: isChecked ? "bold" : "normal" } },
              secondary: { sx: { fontSize: "0.65rem" } }
            }}
          />
        );
      }}
      renderItemDetails={(s, isChecked, former, handleToggle) => {
        const hasDetails = s.type || s.student || s.startDate || s.endDate;
        const dateRange = (s.startDate || s.endDate) ? `${formatDate(s.startDate)} - ${formatDate(s.endDate)}` : "";
        return (
          <Box
            onClick={() => handleToggle(s.id)}
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
                {s.title}
              </Typography>
              {hasDetails && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.65rem" }}>
                  {s.type || ""}{s.type && s.student ? " | " : ""}{s.student ? `Student: ${s.student}` : ""}
                  {(s.type || s.student) && dateRange ? " | " : ""}
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
