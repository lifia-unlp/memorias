import React from "react";
import { Box, InputBase } from "@mui/material";

interface HeaderSearchInputProps {
  onSubmit?: () => void;
  fullWidth?: boolean;
}

export function HeaderSearchInput({ onSubmit, fullWidth = false }: HeaderSearchInputProps) {
  return (
    <Box
      component="form"
      action="/search"
      method="GET"
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "action.hover",
        borderRadius: 2,
        px: 1.5,
        py: fullWidth ? 0.75 : 0.5,
        border: "1px solid",
        borderColor: "divider",
        "&:focus-within": {
          borderColor: "primary.main",
          boxShadow: !fullWidth ? "0 0 0 1px var(--mui-palette-primary-main)" : "none",
        },
        transition: "all 0.2s ease-in-out",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      <svg
        style={{
          width: 16,
          height: 16,
          color: "var(--mui-palette-text-secondary)",
          marginRight: 8,
        }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <InputBase
        name="q"
        placeholder="Search..."
        fullWidth={fullWidth}
        sx={{
          fontSize: "0.85rem",
          color: "text.primary",
          width: fullWidth ? "100%" : 140,
          transition: "width 0.2s ease-in-out",
          "& input:focus": !fullWidth ? {
            width: 200,
          } : {},
        }}
      />
    </Box>
  );
}
