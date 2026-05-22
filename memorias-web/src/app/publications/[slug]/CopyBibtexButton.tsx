"use client";

import React, { useState } from "react";
import { Button } from "@mui/material";

export function CopyBibtexButton({ bibtex }: { bibtex: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outlined"
      size="small"
      color={copied ? "success" : "inherit"}
      sx={{
        fontSize: "0.675rem",
        fontWeight: "bold",
        height: 28,
        borderRadius: 1.5,
        textTransform: "none",
        px: 1.5,
        borderColor: copied ? "success.light" : "divider",
        bgcolor: copied ? "rgba(46, 125, 50, 0.05)" : "transparent",
        "&:hover": {
          borderColor: copied ? "success.main" : "text.primary",
          bgcolor: copied ? "rgba(46, 125, 50, 0.1)" : "action.hover",
        },
      }}
    >
      {copied ? "Copied" : "Copy BibTeX"}
    </Button>
  );
}
