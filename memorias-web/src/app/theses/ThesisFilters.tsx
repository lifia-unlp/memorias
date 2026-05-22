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
} from "@mui/material";

export function ThesisFilters({ levels }: { levels: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page"); // Reset page offset on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleLevelChange = (level: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (level) {
      params.set("level", level);
    } else {
      params.delete("level");
    }
    params.delete("page"); // Reset page offset on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
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
        flexDirection: { xs: "column", sm: "row" },
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
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search theses by title, student, advisor, career..."
          variant="outlined"
        />
      </Box>

      <Box
        sx={{
          width: { xs: "100%", sm: "auto" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <FormControl fullWidth sx={{ width: { sm: 160 } }} size="small">
          <Select
            value={searchParams.get("level") || ""}
            onChange={(e) => handleLevelChange(e.target.value as string)}
            displayEmpty
            inputProps={{ "aria-label": "Level" }}
          >
            <MenuItem value="">All Levels</MenuItem>
            {levels.map((lvl) => (
              <MenuItem key={lvl} value={lvl}>
                {lvl}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ width: { sm: 160 } }} size="small">
          <Select
            value={searchParams.get("status") || ""}
            onChange={(e) => handleStatusChange(e.target.value as string)}
            displayEmpty
            inputProps={{ "aria-label": "Status" }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="ongoing">Ongoing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ width: { sm: 150 } }} size="small">
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
