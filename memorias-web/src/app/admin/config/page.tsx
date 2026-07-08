import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm";
import { Logo } from "@/components/Logo";
import { Box, Container, Typography, Button } from "@mui/material";

export default async function AdminConfigPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    redirect("/");
  }

  // Load current values
  const titleOption = await prisma.systemSetting.findUnique({ where: { key: "welcome_title" } }).catch(() => null);
  const subtitleOption = await prisma.systemSetting.findUnique({ where: { key: "welcome_subtitle" } }).catch(() => null);
  const logoOption = await prisma.systemSetting.findUnique({ where: { key: "logo_url" } }).catch(() => null);
  const labNameOption = await prisma.systemSetting.findUnique({ where: { key: "lab_name" } }).catch(() => null);
  const labUrlOption = await prisma.systemSetting.findUnique({ where: { key: "lab_url" } }).catch(() => null);
  const requireActivationOption = await prisma.systemSetting.findUnique({ where: { key: "require_user_activation" } }).catch(() => null);

  const initialTitle = titleOption?.value || "Welcome to Memorias";
  const initialSubtitle =
    subtitleOption?.value ||
    "A state-of-the-art research repository and laboratory management portal. Discover publications, explore active research projects, and access defended theses.";
  const initialLogoUrl = logoOption?.value || "";
  const initialLabName = labNameOption?.value || process.env.LAB_NAME || "LIFIA";
  const initialLabUrl = labUrlOption?.value || process.env.LAB_URL || "https://lifia.info.unlp.edu.ar";
  const initialRequireUserActivation = requireActivationOption?.value === "true";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Premium Header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          backdropFilter: "blur(8px)",
          bgcolor: "background.paper",
          opacity: 0.95,
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />

          <Box component="nav" sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <LinkButton 
              href="/admin/audit"
              variant="text"
              color="inherit"
              sx={{ textTransform: "none", fontWeight: 500, fontSize: "0.875rem" }}
            >
              Auditing Logs
            </LinkButton>
            <LinkButton 
              href="/admin/users"
              variant="text"
              color="inherit"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                borderLeft: "1px solid",
                borderColor: "divider",
                pl: 3,
                borderRadius: 0,
              }}
            >
              Users Panel
            </LinkButton>
            <LinkButton 
              href="/"
              variant="text"
              color="inherit"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                borderLeft: "1px solid",
                borderColor: "divider",
                pl: 3,
                borderRadius: 0,
              }}
            >
              Back to Portal
            </LinkButton>
          </Box>
        </Container>
      </Box>

      {/* Main Container */}
      <Container maxWidth="md" sx={{ py: 6, flexGrow: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2 }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: "1.75rem", fontWeight: 800, color: "text.primary", mb: 0.5 }}>
              System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customize portal branding, site title welcome headers, and initial landing page introduction configurations.
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "primary.light",
              color: "primary.contrastText",
              px: 2,
              py: 1,
              borderRadius: 3,
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            Authorized Session: {session.user?.name}
          </Box>
        </Box>

        <ConfigForm
          initialTitle={initialTitle}
          initialSubtitle={initialSubtitle}
          initialLogoUrl={initialLogoUrl}
          initialLabName={initialLabName}
          initialLabUrl={initialLabUrl}
          initialRequireUserActivation={initialRequireUserActivation}
        />
      </Container>
    </Box>
  );
}
