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
  ListItemText,
} from "@mui/material";
import { formatAPA } from "@/lib/bibtex";

interface PublicationOption {
  id: string;
  slug?: string;
  title: string;
  type?: string;
  authors?: string;
  year?: number | null;
  bibtexData?: any;
}

interface PublicationSelectorProps {
  items: PublicationOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  layout?: "grid" | "list";
}

const getAPACitation = (pub: any) => {
  const apa = formatAPA(pub);
  if (pub.title) {
    // Escape regex characters in title
    const escapedTitle = pub.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const titleRegex = new RegExp(escapedTitle, "g");
    return apa.replace(titleRegex, `<strong>${pub.title}</strong>`);
  }
  return apa;
};

export function PublicationSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: PublicationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Sort descending by year
  const sortedItems = [...items].sort((a, b) => {
    const yearA = a.year || 0;
    const yearB = b.year || 0;
    return yearB - yearA;
  });

  const filteredItems = sortedItems.filter((item) =>
    matchQueryTokens(searchQuery, [
      item.title,
      item.authors,
      item.year ? String(item.year) : undefined,
    ])
  );

  if (layout === "list") {
    return (
      <Card data-component-semantics="Related publications" variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
            Related Publications
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1, bgcolor: "background.paper" }}>
            <List dense disablePadding>
              {filteredItems.map((pb) => {
                const isChecked = selectedIds.includes(pb.id);
                const apaHtml = getAPACitation(pb);
                return (
                  <ListItemButton
                    key={pb.id}
                    dense
                    onClick={() => handleToggle(pb.id)}
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
                      primary={
                        <span
                          dangerouslySetInnerHTML={{ __html: apaHtml }}
                          style={{ fontSize: "0.75rem", fontWeight: isChecked ? "bold" : "normal" }}
                        />
                      }
                    />
                  </ListItemButton>
                );
              })}
              {filteredItems.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", py: 2 }}>
                  No publications found
                </Typography>
              )}
            </List>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-component-semantics="Related publications" variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyItems: "center", justifyContent: "between", alignItems: { xs: "stretch", md: "center" }, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
              Related Publications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select associated scientific papers or publications.
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: "100%", md: 260 } }}
          />
        </Box>

        {filteredItems.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 2 }}>
            No publications found.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
            <Grid container spacing={2}>
              {filteredItems.map((pub) => {
                const isChecked = selectedIds.includes(pub.id);
                const apaHtml = getAPACitation(pub);
                return (
                  <Grid size={{ xs: 12 }} key={pub.id}>
                    <Box
                      onClick={() => handleToggle(pub.id)}
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
                        <span
                          dangerouslySetInnerHTML={{ __html: apaHtml }}
                          style={{ fontSize: "0.75rem", display: "block", color: "text.primary" }}
                        />
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
