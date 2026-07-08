import React, { useState } from "react";
import Link from "next/link";
import { Button, Menu, MenuItem, Box, Avatar, Typography, Divider } from "@mui/material";

interface ReportsDropdownProps {
  copilotUrl?: string | null;
}

export function ReportsDropdown({ copilotUrl }: ReportsDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          fontSize: "0.85rem",
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        elevation={3}
        sx={{ mt: 1 }}
      >
        <MenuItem
          component={Link}
          href="/reports/statistics"
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          Statistics
        </MenuItem>
        <MenuItem
          component={Link}
          href="/reports/builder"
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          Report Builder
        </MenuItem>
        {copilotUrl && (
          <MenuItem
            component="a"
            href={copilotUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAnchorEl(null)}
            sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
          >
            Copilot
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export function AdminDropdown() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          fontSize: "0.85rem",
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        elevation={3}
        sx={{ mt: 1 }}
      >
        <MenuItem
          component={Link}
          href="/admin/config"
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          System Config
        </MenuItem>
        <MenuItem
          component={Link}
          href="/admin/lists"
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          Lists Dashboard
        </MenuItem>
        <MenuItem
          component={Link}
          href="/admin/users"
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          Users Panel
        </MenuItem>
        <MenuItem
          component={Link}
          href="/admin/tags"
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          Tag Curation
        </MenuItem>
        <Divider />
        <MenuItem
          component={Link}
          href="/admin/audit"
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          Auditing Logs
        </MenuItem>
      </Menu>
    </Box>
  );
}

interface UserDropdownProps {
  session: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  handleSignOut: () => void;
}

export function UserDropdown({ session, handleSignOut }: UserDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box>
      <Button
        data-component-semantics="Session button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          textTransform: "none",
          px: 2,
          py: 0.75,
          borderRadius: 2,
          color: "text.secondary",
          "&:hover": { bgcolor: "action.hover", color: "text.primary" },
        }}
      >
        <Avatar
          src={session.user?.avatarUrl || session.user?.image || undefined}
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
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "inherit" }}>
            {session.user?.name}
          </Typography>
        </Box>
        <svg
          style={{ width: 10, height: 10, color: "currentColor" }}
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        elevation={3}
        sx={{ mt: 1 }}
      >
        <MenuItem
          component={Link}
          href="/preferences"
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
        >
          Preferences
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            handleSignOut();
          }}
          sx={{ fontSize: "0.75rem", fontWeight: "bold", color: "error.main" }}
        >
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
}
