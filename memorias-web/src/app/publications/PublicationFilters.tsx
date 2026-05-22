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
import { SUPPORTED_STYLES } from "@/lib/citations";

export function PublicationFilters({ years }: { years: number[] }) {
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

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type && type !== "all") {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    params.delete("page"); // Reset page offset on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (year && year !== "all") {
      params.set("year", year);
    } else {
      params.delete("year");
    }
    params.delete("page"); // Reset page offset on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStyleChange = (style: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (style && style !== "apa") {
      params.set("style", style);
    } else {
      params.delete("style");
    }
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
        flexDirection: { xs: "column", lg: "row" },
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
          placeholder="Search publications by title, author, or tags..."
          variant="outlined"
        />
      </Box>

      <Box
        sx={{
          width: { xs: "100%", lg: "auto" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <FormControl fullWidth sx={{ width: { sm: 150 } }} size="small">
          <Select
            value={searchParams.get("type") || "all"}
            onChange={(e) => handleTypeChange(e.target.value as string)}
            inputProps={{ "aria-label": "Publication Type" }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="article">Article (Journal)</MenuItem>
            <MenuItem value="inproceedings">Inproceedings (Conference)</MenuItem>
            <MenuItem value="book">Book / Monograph</MenuItem>
            <MenuItem value="phdthesis">PhD Thesis</MenuItem>
            <MenuItem value="mastersthesis">Master's Thesis</MenuItem>
            <MenuItem value="techreport">Technical Report</MenuItem>
            <MenuItem value="misc">Miscellaneous</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ width: { sm: 120 } }} size="small">
          <Select
            value={searchParams.get("year") || "all"}
            onChange={(e) => handleYearChange(e.target.value as string)}
            inputProps={{ "aria-label": "Year" }}
          >
            <MenuItem value="all">All Years</MenuItem>
            {years.map((yr) => (
              <MenuItem key={yr} value={yr.toString()}>
                {yr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ width: { sm: 150 } }} size="small">
          <Select
            value={searchParams.get("style") || "apa"}
            onChange={(e) => handleStyleChange(e.target.value as string)}
            inputProps={{ "aria-label": "Citation Style" }}
          >
            {SUPPORTED_STYLES.map((st) => (
              <MenuItem key={st.value} value={st.value}>
                {st.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ width: { sm: 130 } }} size="small">
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
