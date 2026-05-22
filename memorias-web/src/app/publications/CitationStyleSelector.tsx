"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SUPPORTED_STYLES } from "@/lib/citations";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";

interface CitationStyleSelectorProps {
  initialStyle: string;
}

export function CitationStyleSelector({ initialStyle }: CitationStyleSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: { target: { value: string } }) => {
    const newStyle = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("style", newStyle);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}
      >
        Format:
      </Typography>
      <FormControl size="small">
        <Select
          size="small"
          value={initialStyle}
          onChange={(e) => handleChange({ target: { value: e.target.value } })}
          sx={{ fontSize: "0.75rem", height: 28 }}
        >
          {SUPPORTED_STYLES.map((st) => (
            <MenuItem key={st.value} value={st.value}>
              {st.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
