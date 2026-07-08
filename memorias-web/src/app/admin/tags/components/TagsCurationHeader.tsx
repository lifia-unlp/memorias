import React from "react";
import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";

export function TagsCurationHeader() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        gap: 2,
        pb: 3,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ spaceY: 1 }}>
        <Typography variant="h1" sx={{ fontSize: "1.75rem", fontWeight: 800, color: "text.primary" }}>
          Taxonomy Curation Tools
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Global management portal to rename, merge synonyms, or remove classification tags.
        </Typography>
      </Box>
      <Button
        component={Link}
        href="/"
        variant="outlined"
        color="inherit"
        sx={{
          textTransform: "none",
          borderRadius: 3,
          fontWeight: "bold",
          fontSize: "0.8125rem",
        }}
      >
        Home Dashboard
      </Button>
    </Box>
  );
}
