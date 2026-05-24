import React from "react";
import { Box, Container, Typography, Link as MuiLink, Button } from "@mui/material";
import { getLabName, getLabUrl } from "@/lib/config";

export async function Footer() {
  const labName = await getLabName();
  const labUrl = await getLabUrl();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        backdropFilter: "blur(8px)",
        py: 4,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: { xs: "center", md: "left" }, fontSize: "0.75rem", lineHeight: 1.6 }}
          >
            © {currentYear}{" "}
            <MuiLink
              href={labUrl}
              target="_blank"
              rel="noopener noreferrer"
              color="primary.main"
              underline="always"
              sx={{
                fontWeight: 600,
                textDecorationStyle: "dotted",
                textUnderlineOffset: 3,
                "&:hover": { color: "primary.dark" },
              }}
            >
              {labName}
            </MuiLink>
            . All rights reserved. Powered by{" "}
            <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.75rem" }}>
              Memorias
            </Typography>
            .
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Button
              component="a"
              href="https://github.com/casco/memorias-migration-antigrativy/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                color: "text.secondary",
                borderRadius: 2,
                px: 2,
                py: 0.75,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "action.hover",
                  color: "text.primary",
                },
              }}
            >
              About the Portal
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
