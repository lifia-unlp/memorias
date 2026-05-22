"use client";

import React, { useState, useEffect, useRef } from "react";
import { getTagsMetadata } from "@/app/admin/tags/actions";
import {
  Box,
  Chip,
  OutlinedInput,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
} from "@mui/material";

interface TagWidgetProps {
  initialTags?: string[];
  name?: string;
  placeholder?: string;
  onChange?: (tags: string[]) => void;
}

export function TagWidget({
  initialTags = [],
  name = "tags",
  placeholder = "Type tag and press Enter or comma...",
  onChange,
}: TagWidgetProps) {
  const [tags, setTags] = useState<string[]>(() =>
    initialTags.map((t) => t.trim().toLowerCase()).filter(Boolean)
  );
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [autocompleteTags, setAutocompleteTags] = useState<string[]>([]);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load tag suggestions client-side dynamically
  useEffect(() => {
    async function loadMetadata() {
      try {
        const meta = await getTagsMetadata();
        if (meta) {
          setPopularTags(meta.popular);
          setAutocompleteTags(meta.distinct);
        }
      } catch (err) {
        console.error("Failed to load tags autocomplete metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputContainerRef.current &&
        !inputContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addTag = (tagToAdd: string) => {
    const sanitized = tagToAdd.trim().toLowerCase().replace(/\s+/g, " ");
    if (sanitized && !tags.includes(sanitized)) {
      const nextTags = [...tags, sanitized];
      setTags(nextTags);
      onChange?.(nextTags);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (indexToRemove: number) => {
    const nextTags = tags.filter((_, idx) => idx !== indexToRemove);
    setTags(nextTags);
    onChange?.(nextTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent accidental form submissions
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "," || e.key === "Tab") {
      if (e.key === ",") {
        e.preventDefault();
      }
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue) {
      // Remove last tag on Backspace if input is empty
      if (tags.length > 0) {
        removeTag(tags.length - 1);
      }
    }
  };

  // Filter autocomplete suggestions based on query
  const suggestions = autocompleteTags
    .map((t) => t.toLowerCase().trim())
    .filter(
      (t) =>
        t.includes(inputValue.toLowerCase()) &&
        !tags.includes(t) &&
        t !== inputValue.trim().toLowerCase()
    );

  const displaySuggestions = isOpen && inputValue.trim().length > 0 && suggestions.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}>
      {/* 1. Visual Tags Pills Container */}
      {tags.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            p: 1.5,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.01)",
            borderRadius: 2,
            minHeight: "44px",
            alignItems: "center",
          }}
        >
          {tags.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              onDelete={() => removeTag(idx)}
              color="primary"
              variant="outlined"
              size="small"
              sx={{
                fontWeight: "bold",
                borderRadius: 1.5,
                bgcolor: (theme) => theme.palette.primary.light,
              }}
            />
          ))}
        </Box>
      )}
      {/* 2. Text Input & AutoComplete Suggestions */}
      <Box sx={{ position: "relative", width: "100%" }} ref={inputContainerRef}>
        <OutlinedInput
          fullWidth
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          size="small"
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            "& .MuiOutlinedInput-input": {
              py: 1,
              px: 1.5,
              fontSize: "0.875rem",
            },
          }}
        />

        {/* Dynamic Autocomplete Suggestions Overlay */}
        <Popper
          open={displaySuggestions}
          anchorEl={inputContainerRef.current}
          placement="bottom-start"
          disablePortal={false}
          style={{ width: inputContainerRef.current?.clientWidth, zIndex: 1300 }}
        >
          <Paper
            ref={dropdownRef}
            elevation={3}
            sx={{
              mt: 0.5,
              maxHeight: 180,
              overflowY: "auto",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <List dense sx={{ py: 0.5 }}>
              {suggestions.map((suggestion) => (
                <ListItemButton
                  key={suggestion}
                  onClick={() => addTag(suggestion)}
                  sx={{
                    py: 1,
                    px: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: 0 },
                  }}
                >
                  <ListItemText
                    primary={`Lightbulb: ${suggestion}`}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }
                      }
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
      {/* 3. Clickable Top 10 Popular Tags Pills */}
      {popularTags.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              fontWeight: 800,
              color: "text.secondary",
              fontSize: "0.625rem",
              mb: 0.5,
            }}
          >
            Popular Tags (Click to quick-add)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {popularTags.map((popTag) => {
              const sanitized = popTag.trim().toLowerCase();
              const isSelected = tags.includes(sanitized);
              return (
                <Button
                  key={popTag}
                  disabled={isSelected}
                  onClick={() => addTag(sanitized)}
                  size="small"
                  variant="outlined"
                  sx={{
                    py: 0.25,
                    px: 1,
                    fontSize: "0.625rem",
                    fontWeight: 750,
                    borderRadius: 1.5,
                    color: isSelected ? "text.disabled" : "text.secondary",
                    borderColor: isSelected ? "divider" : "divider",
                    textTransform: "lowercase",
                    bgcolor: isSelected ? "rgba(0, 0, 0, 0.04)" : "background.paper",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "primary.light",
                    },
                  }}
                >
                  + {sanitized}
                </Button>
              );
            })}
          </Box>
        </Box>
      )}
      {/* Hidden input to pass selected tags in standard form post submissions */}
      <input type="hidden" name={name} value={tags.join(",")} />
    </Box>
  );
}
