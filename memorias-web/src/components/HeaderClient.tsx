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
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Container,
} from "@mui/material";

interface HeaderClientProps {
  session: any;
  logoUrl: string | null;
  activeTab?: "members" | "projects" | "theses" | "scholarships" | "publications";
}

export function HeaderClient({ session, logoUrl, activeTab }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reportsAnchor, setReportsAnchor] = useState<null | HTMLElement>(null);
  const [adminAnchor, setAdminAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  const isLoggedIn = !!session?.user;
  const isEditorOrAdmin =
    session?.user?.active &&
    (session.user.role === "EDITOR" || session.user.role === "ADMIN");
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
            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ height: 38, width: "auto", objectFit: "contain" }}
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
                      fontSize: "0.75rem",
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
              {isEditorOrAdmin && (
                <Box>
                  <Button
                    onClick={(e) => setReportsAnchor(e.currentTarget)}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      px: 2,
                      py: 0.75,
                      color: "text.secondary",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                    }}
                  >
                    Reports
                    <svg
                      style={{ marginLeft: 4, width: 10, height: 10 }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                  <Menu
                    anchorEl={reportsAnchor}
                    open={Boolean(reportsAnchor)}
                    onClose={() => setReportsAnchor(null)}
                    elevation={3}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem
                      component={Link}
                      href="/reports/statistics"
                      onClick={() => setReportsAnchor(null)}
                      sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                    >
                      Statistics
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/reports/builder"
                      onClick={() => setReportsAnchor(null)}
                      sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                    >
                      Report Builder
                    </MenuItem>
                  </Menu>
                </Box>
              )}

              {/* Admin Dropdown */}
              {isAdmin && (
                <Box>
                  <Button
                    onClick={(e) => setAdminAnchor(e.currentTarget)}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      px: 2,
                      py: 0.75,
                      color: "text.secondary",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                    }}
                  >
                    Admin
                    <svg
                      style={{ marginLeft: 4, width: 10, height: 10 }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                  <Menu
                    anchorEl={adminAnchor}
                    open={Boolean(adminAnchor)}
                    onClose={() => setAdminAnchor(null)}
                    elevation={3}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem
                      component={Link}
                      href="/admin/config"
                      onClick={() => setAdminAnchor(null)}
                      sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                    >
                      System Config
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/admin/lists"
                      onClick={() => setAdminAnchor(null)}
                      sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                    >
                      Lists Dashboard
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/admin/users"
                      onClick={() => setAdminAnchor(null)}
                      sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                    >
                      Users Panel
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/admin/tags"
                      onClick={() => setAdminAnchor(null)}
                      sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                    >
                      Tag Curation
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      component={Link}
                      href="/admin/audit"
                      onClick={() => setAdminAnchor(null)}
                      sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                    >
                      Auditing Logs
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          </Box>

          {/* User Section & Mobile Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isLoggedIn ? (
              <Box>
                <Button
                  onClick={(e) => setUserAnchor(e.currentTarget)}
                  sx={{
                    textTransform: "none",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    color: "text.primary",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Avatar
                    src={session.user?.image || undefined}
                    sx={{
                      width: 28,
                      height: 28,
                      mr: 1.25,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      bgcolor: "primary.light",
                      color: "primary.main",
                    }}
                  >
                    {session.user?.name?.[0] || "U"}
                  </Avatar>
                  <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left", mr: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.75rem", lineHeight: 1.1 }}>
                      {session.user?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.625rem", color: "text.secondary", textTransform: "uppercase", fontWeight: 800 }}>
                      {session.user?.role}
                    </Typography>
                  </Box>
                  <svg
                    style={{ width: 10, height: 10, color: "gray" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
                <Menu
                  anchorEl={userAnchor}
                  open={Boolean(userAnchor)}
                  onClose={() => setUserAnchor(null)}
                  elevation={3}
                  sx={{ mt: 1 }}
                >
                  <MenuItem
                    component={Link}
                    href="/preferences"
                    onClick={() => setUserAnchor(null)}
                    sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                  >
                    Preferences
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={handleSignOut}
                    sx={{ fontSize: "0.75rem", fontWeight: "bold", color: "error.main" }}
                  >
                    Sign Out
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                component={Link}
                href="/auth/signin"
                variant="contained"
                size="small"
                sx={{ fontSize: "0.75rem", fontWeight: "bold", px: 2, py: 0.75 }}
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
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 260 },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Menu
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)} size="small">
            <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {navLinks.map((link) => (
            <ListItemButton
              key={link.value}
              component={Link}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              selected={activeTab === link.value}
              sx={{ borderRadius: 1.5, my: 0.25 }}
            >
              <ListItemText
                primary={link.label}
                slotProps={{
                  primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                }}
              />
            </ListItemButton>
          ))}
        </List>

        {isEditorOrAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ px: 3, fontWeight: "black", color: "text.disabled", textTransform: "uppercase", fontSize: "0.625rem" }}>
              Reports
            </Typography>
            <List sx={{ px: 1 }}>
              <ListItemButton
                component={Link}
                href="/reports/statistics"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, my: 0.25 }}
              >
                <ListItemText
                  primary="Statistics"
                  slotProps={{
                    primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                  }}
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                href="/reports/builder"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, my: 0.25 }}
              >
                <ListItemText
                  primary="Report Builder"
                  slotProps={{
                    primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                  }}
                />
              </ListItemButton>
            </List>
          </>
        )}

        {isAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ px: 3, fontWeight: "black", color: "text.disabled", textTransform: "uppercase", fontSize: "0.625rem" }}>
              Admin Console
            </Typography>
            <List sx={{ px: 1 }}>
              <ListItemButton
                component={Link}
                href="/admin/config"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, my: 0.25 }}
              >
                <ListItemText
                  primary="System Config"
                  slotProps={{
                    primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                  }}
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                href="/admin/lists"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, my: 0.25 }}
              >
                <ListItemText
                  primary="Lists Dashboard"
                  slotProps={{
                    primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                  }}
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                href="/admin/users"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, my: 0.25 }}
              >
                <ListItemText
                  primary="Users Panel"
                  slotProps={{
                    primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                  }}
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                href="/admin/tags"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, my: 0.25 }}
              >
                <ListItemText
                  primary="Tag Curation"
                  slotProps={{
                    primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                  }}
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                href="/admin/audit"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, my: 0.25 }}
              >
                <ListItemText
                  primary="Auditing Logs"
                  slotProps={{
                    primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                  }}
                />
              </ListItemButton>
            </List>
          </>
        )}
      </Drawer>
    </AppBar>
  );
}
