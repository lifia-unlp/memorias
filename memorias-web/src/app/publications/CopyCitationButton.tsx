"use client";

import React, { useState } from "react";
import { Button } from "@mui/material";

interface CopyCitationButtonProps {
  textToCopy: string;
}

export function CopyCitationButton({ textToCopy }: CopyCitationButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      size="small"
      variant="outlined"
      color={copied ? "success" : "inherit"}
      onClick={handleCopy}
      title="Copy citation to clipboard"
      sx={{
        py: 0.25,
        px: 1,
        fontSize: "0.625rem",
        fontWeight: 750,
        height: 24,
        borderRadius: 1.5,
        textTransform: "uppercase",
        borderColor: copied ? "success.main" : "divider",
        color: copied ? "success.main" : "text.secondary",
        bgcolor: copied ? "success.light" : "transparent",
        "&:hover": {
          borderColor: copied ? "success.dark" : "text.primary",
          bgcolor: copied ? "success.light" : "action.hover",
        },
      }}
    >
      {copied ? "Copied!" : "Copy Citation"}
    </Button>
  );
}
