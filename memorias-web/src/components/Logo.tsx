import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Box, Typography } from "@mui/material";

export async function Logo() {
  const logoSetting = await prisma.systemSetting
    .findUnique({ where: { key: "logo_url" } })
    .catch(() => null);
  const logoUrl = logoSetting?.value || "";

  return (
    <Link
      href="/"
      style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          "&:hover": {
            opacity: 0.9,
          },
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          (<Box
            component="img"
            src={logoUrl}
            alt="Logo"
            sx={{
              height: 45,
              width: "auto",
              objectFit: "contain",
            }}
          />)
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.disabled",
              fontWeight: 600,
            }}
          >
            (your logo here)
          </Typography>
        )}
      </Box>
    </Link>
  );
}
