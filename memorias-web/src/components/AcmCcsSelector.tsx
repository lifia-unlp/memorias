"use client";

import React, { useState, useMemo, useEffect } from "react";
import treeData from "../lib/acm_ccs.json";
import flatLookup from "../lib/acm_ccs_flat.json";
import { getAcmCcsPath } from "../lib/acm-ccs-utils";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface AcmCcsSelectorProps {
  initialValue?: string | null; // Can be a JSON array string or legacy plain text
  onChange?: (selectedIds: string[]) => void;
}

export function AcmCcsSelector({ initialValue, onChange }: AcmCcsSelectorProps) {
  // Safe-initialize selected IDs from legacy text or JSON array
  const initialIds = useMemo<string[]>(() => {
    if (!initialValue) return [];
    const trimmed = initialValue.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string");
        }
      } catch (e) {
        // Fallback if parsing fails
      }
    }
    return []; // Legacy raw text will not be loaded into the selector but preserved as fallback in hidden/raw inputs if needed
  }, [initialValue]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set<string>());

  // Notify parent on selection change
  useEffect(() => {
    if (onChange) {
      onChange(selectedIds);
    }
  }, [selectedIds, onChange]);

  // Toggle expansion of a node
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle selection of a category ID
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Quick-remove action for selected list
  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  // Search filtering logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { matchedIds: new Set<string>(), ancestorIds: new Set<string>() };
    }

    const normalizedQuery = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const matchedIds = new Set<string>();
    const ancestorIds = new Set<string>();

    for (const [id, label] of Object.entries(flatLookup)) {
      const normalizedLabel = label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (normalizedLabel.includes(normalizedQuery)) {
        matchedIds.add(id);

        // Track ancestors to ensure they are visible and expanded
        const parts = id.split(".");
        let current = "";
        for (let i = 0; i < parts.length - 1; i++) {
          current = current ? `${current}.${parts[i]}` : parts[i];
          ancestorIds.add(current);
        }
      }
    }

    return { matchedIds, ancestorIds };
  }, [searchQuery]);

  const { matchedIds, ancestorIds } = searchResults;
  const isSearching = searchQuery.trim().length > 0;

  // Auto-expand searched matches when search changes
  useEffect(() => {
    if (isSearching) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestorIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [isSearching, ancestorIds]);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedIds.includes(node.id);

    // If searching, hide nodes that aren't matched and don't contain matched descendants
    if (isSearching && !matchedIds.has(node.id) && !ancestorIds.has(node.id)) {
      return null;
    }

    const isMatch = isSearching && matchedIds.has(node.id);

    return (
      <Box key={node.id} sx={{ pl: depth > 0 ? 3 : 0, mt: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            py: 0.5,
            px: 1,
            borderRadius: 1,
            transition: "background-color 0.15s ease",
            bgcolor: isMatch ? "rgba(var(--mui-palette-primary-main-channel), 0.12)" : "transparent",
            "&:hover": {
              bgcolor: isMatch
                ? "rgba(var(--mui-palette-primary-main-channel), 0.18)"
                : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          {/* Collapse/Expand Toggle Indicator */}
          <Box
            onClick={() => hasChildren && toggleExpand(node.id)}
            sx={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: hasChildren ? "pointer" : "default",
              color: "text.secondary",
              userSelect: "none",
              fontSize: "0.75rem",
              fontWeight: "bold",
              transition: "transform 0.15s ease",
              mr: 0.5,
            }}
          >
            {hasChildren ? (isExpanded ? "▼" : "▶") : ""}
          </Box>

          {/* Node Checkbox & Label */}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isSelected}
                onChange={() => toggleSelect(node.id)}
                sx={{ p: 0.5 }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? "bold" : isMatch ? 800 : "normal",
                  color: isSelected
                    ? "primary.main"
                    : isMatch
                    ? "primary.dark"
                    : "text.primary",
                }}
              >
                {node.label}
              </Typography>
            }
            sx={{ m: 0, flex: 1 }}
          />
        </Box>

        {/* Children Subtree */}
        {hasChildren && isExpanded && (
          <Box sx={{ borderLeft: "1px dashed", borderColor: "divider", ml: 1.5 }}>
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Hidden form input holding serialized array for standard POST submit */}
      <input type="hidden" name="interestsInEnglish" value={JSON.stringify(selectedIds)} />

      {/* Grid Layout separating selector and preview */}
      <Grid container spacing={3}>
        {/* Left Column: Search & Selection Tree */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%", maxHeight: 520, display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search ACM CCS categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
              />
            </Box>
            <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
              {(treeData as TreeNode[]).map((node) => renderTreeNode(node))}
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Selected list and paths */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%", maxHeight: 520, display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Selected English Research Interests
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "bold" }}>
                {selectedIds.length} categories
              </Typography>
            </Box>
            <Box sx={{ p: 2, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
              {selectedIds.length === 0 ? (
                <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", textAlign: "center" }}>
                    No ACM CCS classification categories selected.<br />
                    Use the panel on the left to browse and select.
                  </Typography>
                </Box>
              ) : (
                selectedIds.map((id) => {
                  const label = (flatLookup as Record<string, string>)[id] || id;
                  const path = getAcmCcsPath(id);
                  return (
                    <Card
                      key={id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        position: "relative",
                        bgcolor: "rgba(var(--mui-palette-primary-main-channel), 0.02)",
                        borderColor: "divider",
                        "&:hover": {
                          borderColor: "primary.light",
                          bgcolor: "rgba(var(--mui-palette-primary-main-channel), 0.04)",
                        },
                      }}
                    >
                      <Box sx={{ pr: 6 }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                          {label}
                        </Typography>
                        {path.length > 1 && (
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                            {path.slice(0, -1).join(" • ")}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemove(id)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          minWidth: "auto",
                          p: 0.5,
                          fontSize: "0.625rem",
                          textTransform: "none",
                          fontWeight: "bold",
                        }}
                      >
                        Remove
                      </Button>
                    </Card>
                  );
                })
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
