"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export function MemberFilters({ positions }: { positions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const hideFormerParam = searchParams.get("hideFormer");
  const hideFormer = hideFormerParam !== "false";

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }
    params.delete("page"); // Reset page offset on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePositionChange = (pos: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pos) {
      params.set("position", pos);
    } else {
      params.delete("position");
    }
    params.delete("page"); // Reset page offset on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleHideFormerChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!checked) {
      params.set("hideFormer", "false");
    } else {
      params.delete("hideFormer");
    }
    params.delete("page"); // Reset page offset on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleLimitChange = (limit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (limit && limit !== "10") {
      params.set("limit", limit);
    } else {
      params.delete("limit");
    }
    params.delete("page"); // Reset page offset on limit change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        alignItems: "center",
        width: "100%",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        p: 2,
        borderRadius: 3,
        boxShadow: 1,
      }}
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        <TextField
          fullWidth
          size="small"
          defaultValue={searchParams.get("query") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search members by name, position, or tags..."
          variant="outlined"
        />
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: "auto" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={hideFormer}
              onChange={(e) => handleHideFormerChange(e.target.checked)}
              size="small"
              sx={{ p: 0.5 }}
            />
          }
          label={<span style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>Hide former members</span>}
          sx={{ m: 0 }}
        />

        <FormControl fullWidth sx={{ width: { sm: 180 } }} size="small">
          <Select
            value={searchParams.get("position") || ""}
            onChange={(e) => handlePositionChange(e.target.value as string)}
            displayEmpty
            inputProps={{ "aria-label": "Position at Lab" }}
          >
            <MenuItem value="">All Positions</MenuItem>
            {positions.map((pos) => (
              <MenuItem key={pos} value={pos}>
                {pos}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ width: { sm: 160 } }} size="small">
          <Select
            value={searchParams.get("limit") || "10"}
            onChange={(e) => handleLimitChange(e.target.value as string)}
            inputProps={{ "aria-label": "Items per page" }}
          >
            <MenuItem value="10">10 per page</MenuItem>
            <MenuItem value="20">20 per page</MenuItem>
            <MenuItem value="30">30 per page</MenuItem>
            <MenuItem value="100">100 per page</MenuItem>
          </Select>
        </FormControl>

        {isPending && (
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Loading...
          </Typography>
        )}
      </Box>
    </Box>
  );
}
