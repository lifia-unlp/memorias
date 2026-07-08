"use client";

import React from "react";
import { EntitySelector } from "./EntitySelector";
import { Box, Checkbox, ListItemText } from "@mui/material";
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

const sortPublications = (items: PublicationOption[]) => {
  return [...items].sort((a, b) => {
    const yearA = a.year || 0;
    const yearB = b.year || 0;
    return yearB - yearA;
  });
};

export function PublicationSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: PublicationSelectorProps) {
  return (
    <EntitySelector<PublicationOption>
      title="Related Publications"
      subtitle="Select associated scientific papers or publications."
      searchPlaceholder="Search publications..."
      items={items}
      selectedIds={selectedIds}
      onChange={onChange}
      layout={layout}
      semanticsLabel="Related publications"
      getItemId={(p) => p.id}
      getSearchableFields={(p) => [
        p.title,
        p.authors,
        p.year ? String(p.year) : undefined,
      ]}
      sortItems={sortPublications}
      gridSizes={{ xs: 12 }}
      renderListItem={(pub, isChecked) => {
        const apaHtml = getAPACitation(pub);
        return (
          <ListItemText
            primary={
              <span
                dangerouslySetInnerHTML={{ __html: apaHtml }}
                style={{ fontSize: "0.75rem", fontWeight: isChecked ? "bold" : "normal" }}
              />
            }
          />
        );
      }}
      renderItemDetails={(pub, isChecked, former, handleToggle) => {
        const apaHtml = getAPACitation(pub);
        return (
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
            <Checkbox checked={isChecked} size="small" sx={{ p: 0.5 }} />
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <span
                dangerouslySetInnerHTML={{ __html: apaHtml }}
                style={{ fontSize: "0.75rem", display: "block", color: "text.primary" }}
              />
            </Box>
          </Box>
        );
      }}
    />
  );
}
