import React from "react";
import Link from "next/link";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { HeaderSearchInput } from "./HeaderSearchInput";

interface NavLink {
  label: string;
  href: string;
  value: string;
}

interface MobileNavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  activeTab?: string;
  isEditorOrAdmin: boolean;
  isAdmin: boolean;
  copilotUrl?: string | null;
}

export function MobileNavigationDrawer({
  open,
  onClose,
  navLinks,
  activeTab,
  isEditorOrAdmin,
  isAdmin,
  copilotUrl,
}: MobileNavigationDrawerProps) {
  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
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
        <IconButton onClick={onClose} size="small">
          <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <HeaderSearchInput onSubmit={onClose} fullWidth />
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {navLinks.map((link) => (
          <ListItemButton
            key={link.value}
            component={Link}
            href={link.href}
            onClick={onClose}
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
              onClick={onClose}
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
              onClick={onClose}
              sx={{ borderRadius: 1.5, my: 0.25 }}
            >
              <ListItemText
                primary="Report Builder"
                slotProps={{
                  primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                }}
              />
            </ListItemButton>
            {copilotUrl && (
              <ListItemButton
                component="a"
                href={copilotUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                sx={{ borderRadius: 1.5, my: 0.25 }}
              >
                <ListItemText
                  primary="Copilot"
                  slotProps={{
                    primary: { sx: { fontSize: "0.8rem", fontWeight: "bold" } }
                  }}
                />
              </ListItemButton>
            )}
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
              onClick={onClose}
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
              onClick={onClose}
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
              onClick={onClose}
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
              onClick={onClose}
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
              onClick={onClose}
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
  );
}
