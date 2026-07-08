"use client";

import React, { useState } from "react";
import { matchQueryTokens } from "@/lib/search";
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
  FormControlLabel,
} from "@mui/material";

export interface EntitySelectorProps<T> {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  items: T[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  layout?: "grid" | "list";
  semanticsLabel: string;
  getItemId: (item: T) => string;
  getSearchableFields: (item: T) => (string | null | undefined)[];
  sortItems: (items: T[]) => T[];
  renderItemDetails: (item: T, isChecked: boolean, isFormer: boolean, handleToggle: (id: string) => void) => React.ReactNode;
  renderListItem: (item: T, isChecked: boolean, isFormer: boolean) => React.ReactNode;
  showFormerToggle?: boolean;
  isFormer?: (item: T) => boolean;
  gridSizes?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export function EntitySelector<T>({
  title,
  subtitle,
  searchPlaceholder,
  items,
  selectedIds,
  onChange,
  layout = "grid",
  semanticsLabel,
  getItemId,
  getSearchableFields,
  sortItems,
  renderItemDetails,
  renderListItem,
  showFormerToggle = false,
  isFormer = () => false,
  gridSizes = { xs: 12, sm: 6 },
}: EntitySelectorProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideFormer, setHideFormer] = useState(true);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const sortedItems = sortItems(items);

  const filteredItems = sortedItems.filter((item) => {
    const id = getItemId(item);
    const former = isFormer(item);
    if (showFormerToggle && hideFormer && former && !selectedIds.includes(id)) {
      return false;
    }
    return matchQueryTokens(searchQuery, getSearchableFields(item));
  });

  if (layout === "list") {
    return (
      <Card data-component-semantics={semanticsLabel} variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
            {title}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {showFormerToggle && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={hideFormer}
                  onChange={(e) => setHideFormer(e.target.checked)}
                  size="small"
                  sx={{ p: 0.5 }}
                />
              }
              label={<span style={{ fontSize: "0.75rem" }}>Hide former members</span>}
              sx={{ m: 0 }}
            />
          )}
          <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1, bgcolor: "background.paper" }}>
            <List dense disablePadding>
              {filteredItems.map((item) => {
                const id = getItemId(item);
                const isChecked = selectedIds.includes(id);
                const former = isFormer(item);
                return (
                  <ListItemButton
                    key={id}
                    dense
                    onClick={() => handleToggle(id)}
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
                    {renderListItem(item, isChecked, former)}
                  </ListItemButton>
                );
              })}
              {filteredItems.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", py: 2 }}>
                  No items found
                </Typography>
              )}
            </List>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-component-semantics={semanticsLabel} variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyItems: "center", justifyContent: "between", alignItems: { xs: "stretch", md: "center" }, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 2 }}>
            {showFormerToggle && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hideFormer}
                    onChange={(e) => setHideFormer(e.target.checked)}
                    size="small"
                    sx={{ p: 0.5 }}
                  />
                }
                label={<span style={{ fontSize: "0.75rem" }}>Hide former members</span>}
                sx={{ m: 0 }}
              />
            )}
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: "100%", md: 260 } }}
            />
          </Box>
        </Box>

        {filteredItems.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 2 }}>
            No items found.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
            <Grid container spacing={2}>
              {filteredItems.map((item) => {
                const id = getItemId(item);
                const isChecked = selectedIds.includes(id);
                const former = isFormer(item);
                return (
                  <Grid size={gridSizes} key={id}>
                    {renderItemDetails(item, isChecked, former, handleToggle)}
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
