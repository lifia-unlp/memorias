"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Container,
} from "@mui/material";
import { HeaderSearchInput } from "./HeaderSearchInput";
import { ReportsDropdown, AdminDropdown, UserDropdown } from "./HeaderDropdownMenu";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";

interface HeaderClientProps {
  session: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  logoUrl: string | null;
  activeTab?: "members" | "projects" | "theses" | "scholarships" | "publications";
  copilotUrl?: string | null;
}

export function HeaderClient({ session, logoUrl, activeTab, copilotUrl }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!session?.user;
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN" || session.user.role === "POWER_EDITOR");
  const isAdmin = session?.user?.role === "ADMIN";

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" });
  };

  const navLinks = [
    { label: "Members", href: "/members", value: "members" },
    { label: "Projects", href: "/projects", value: "projects" },
    { label: "Theses", href: "/theses", value: "theses" },
    { label: "Scholarships", href: "/scholarships", value: "scholarships" },
    { label: "Publications", href: "/publications", value: "publications" },
  ];

  return (
    <AppBar
      data-component-semantics="Menubar"
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 64, justifyContent: "space-between" }}>
          {/* Logo & Navigation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {/* Logo */}
            <Link
              data-component-semantics="Menubar logo"
              href="/"
              style={{ display: "flex", alignItems: "center" }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ height: 45, width: "auto", objectFit: "contain" }}
                />
              ) : (
                <Typography
                  variant="subtitle2"
                  sx={{ fontStyle: "italic", color: "text.disabled", fontWeight: 700 }}
                >
                  Memorias
                </Typography>
              )}
            </Link>

            {/* Desktop Navigation Links */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navLinks.map((link) => {
                const isActive = activeTab === link.value;
                return (
                  <Button
                    key={link.value}
                    component={Link}
                    href={link.href}
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 800 : 700,
                      px: 2,
                      py: 0.75,
                      color: isActive ? "primary.main" : "text.secondary",
                      bgcolor: isActive ? "primary.light" : "transparent",
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: isActive ? "primary.light" : "action.hover",
                        color: isActive ? "primary.main" : "text.primary",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}

              {/* Reports Dropdown */}
              {isEditorOrAdmin && <ReportsDropdown copilotUrl={copilotUrl} />}

              {/* Admin Dropdown */}
              {isAdmin && <AdminDropdown />}
            </Box>
          </Box>

          {/* User Section & Mobile Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Search Input Box */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <HeaderSearchInput />
            </Box>

            {isLoggedIn ? (
              <UserDropdown session={session} handleSignOut={handleSignOut} />
            ) : (
              <Button
                data-component-semantics="Session button"
                component={Link}
                href="/auth/signin"
                variant="text"
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  color: "text.secondary",
                  "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                }}
              >
                Sign In
              </Button>
            )}

            {/* Mobile Navigation Toggle Hamburger */}
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { xs: "block", md: "none" }, p: 1 }}
            >
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Slide-out Mobile Menu Drawer */}
      <MobileNavigationDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
        activeTab={activeTab}
        isEditorOrAdmin={isEditorOrAdmin}
        isAdmin={isAdmin}
        copilotUrl={copilotUrl}
      />
    </AppBar>
  );
}
