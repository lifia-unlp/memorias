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

const formatDate = (d: any) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" });
};

export function ThesisSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: ThesisSelectorProps) {
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
    `${item.title} ${item.student || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (layout === "list") {
    return (
      <Card data-component-semantics="Related theses" variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
            Related Theses
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search theses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1, bgcolor: "background.paper" }}>
            <List dense disablePadding>
              {filteredItems.map((t) => {
                const isChecked = selectedIds.includes(t.id);
                const hasDetails = t.level || t.student || t.director;
                const detailsText = `${t.level || ""}${t.level && t.student ? " | " : ""}${t.student ? `Student: ${t.student}` : ""}${((t.level || t.student) && t.director) ? " | " : ""}${t.director ? `Dir: ${t.director}${t.coDirector ? ` / Co-Dir: ${t.coDirector}` : ""}` : ""}`;
                return (
                  <ListItemButton
                    key={t.id}
                    dense
                    onClick={() => handleToggle(t.id)}
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
                      primary={t.title}
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
                  No theses found
                </Typography>
              )}
            </List>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-component-semantics="Related theses" variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyItems: "center", justifyContent: "between", alignItems: { xs: "stretch", md: "center" }, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
              Related Theses
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select associated theses.
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search theses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: "100%", md: 260 } }}
          />
        </Box>

        {filteredItems.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 2 }}>
            No theses found.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
            <Grid container spacing={2}>
              {filteredItems.map((t) => {
                const isChecked = selectedIds.includes(t.id);
                const hasDetails = t.level || t.student || t.director;
                const detailsText = `${t.level || ""}${t.level && t.student ? " | " : ""}${t.student ? `Student: ${t.student}` : ""}${((t.level || t.student) && t.director) ? " | " : ""}${t.director ? `Dir: ${t.director}${t.coDirector ? ` / Co-Dir: ${t.coDirector}` : ""}` : ""}`;
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={t.id}>
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
                      <Checkbox
                        checked={isChecked}
                        size="small"
                        sx={{ p: 0.5 }}
                      />
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
