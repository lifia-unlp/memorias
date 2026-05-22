"use client";

import React, { useState, useTransition } from "react";
import { saveSystemSettings } from "./actions";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
} from "@mui/material";

interface ConfigFormProps {
  initialTitle: string;
  initialSubtitle: string;
  initialLogoUrl: string;
  initialLabName: string;
  initialLabUrl: string;
  initialRequireUserActivation: boolean;
}

export function ConfigForm({
  initialTitle,
  initialSubtitle,
  initialLogoUrl,
  initialLabName,
  initialLabUrl,
  initialRequireUserActivation,
}: ConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  const [welcomeTitle, setWelcomeTitle] = useState(initialTitle);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(initialSubtitle);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [labName, setLabName] = useState(initialLabName);
  const [labUrl, setLabUrl] = useState(initialLabUrl);
  const [requireUserActivation, setRequireUserActivation] = useState(initialRequireUserActivation);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotification(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await saveSystemSettings(formData);
        setNotification({
          type: "success",
          message: "System configuration saved successfully!",
        });
      } catch (err: any) {
        setNotification({
          type: "error",
          message: err.message || "Failed to update configuration settings.",
        });
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 8 }}>
      {notification && (
        <Alert severity={notification.type} icon={false} sx={{ borderRadius: 3, fontWeight: "bold" }}>
          {notification.message}
        </Alert>
      )}
      {/* 1. Logo & Portal Branding Card */}
      <Paper sx={{ p: 4, borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2, mb: 3 }}>
          <Typography variant="h3" sx={{ fontSize: "1.15rem", fontWeight: 800, color: "primary.main", mb: 0.5 }}>
            Portal Branding & Identity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Configure the logo appearing in the navigation header.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", tracking: "0.5px", mb: 1, display: "block" }}>
              Live Logo Preview
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", height: 50 }}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                (<Box
                  component="img"
                  src={logoUrl}
                  alt="Live Logo Preview"
                  sx={{ height: 40, width: "auto", objectFit: "contain" }}
                  onError={(e: any) => {
                    e.target.style.display = "none";
                  }}
                />)
              ) : (
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.disabled", fontWeight: 600 }}>
                  (your logo here)
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
              Logo Image URL
            </Typography>
            <TextField
              fullWidth
              name="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="e.g. /my-lab-logo.png or https://example.com/logo.svg"
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Provide an absolute path relative to the public folder (e.g. `/images/logo.svg`) or an external URL. Leave blank to display the default text legend.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
              Laboratory Name *
            </Typography>
            <TextField
              fullWidth
              name="labName"
              required
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="e.g. LIFIA"
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              The display name of the laboratory, used in footers across the site.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
              Laboratory Official URL *
            </Typography>
            <TextField
              fullWidth
              name="labUrl"
              type="url"
              required
              value={labUrl}
              onChange={(e) => setLabUrl(e.target.value)}
              placeholder="e.g. https://lifia.info.unlp.edu.ar"
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              The official homepage link for the laboratory, referenced in copyright footers.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      {/* 2. Welcome & Introduction Card */}
      <Paper sx={{ p: 4, borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2, mb: 3 }}>
          <Typography variant="h3" sx={{ fontSize: "1.15rem", fontWeight: 800, color: "primary.main", mb: 0.5 }}>
            Landing Page Welcome Area
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
              Welcome Title *
            </Typography>
            <TextField
              fullWidth
              name="welcomeTitle"
              required
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              placeholder="Welcome to Memorias"
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
              Welcome Subtitle & Description *
            </Typography>
            <TextField
              fullWidth
              name="welcomeSubtitle"
              required
              multiline
              rows={4}
              value={welcomeSubtitle}
              onChange={(e) => setWelcomeSubtitle(e.target.value)}
              placeholder="Provide a detailed introductory bio for the laboratory dashboard..."
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>
      {/* 3. User Management & Security Card */}
      <Paper sx={{ p: 4, borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2, mb: 3 }}>
          <Typography variant="h3" sx={{ fontSize: "1.15rem", fontWeight: 800, color: "primary.main", mb: 0.5 }}>
            User Management & Security
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="requireUserActivation"
                checked={requireUserActivation}
                onChange={(e) => setRequireUserActivation(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                Require Administrator Activation for New Users
              </Typography>
            }
          />
          <Typography variant="caption" color="text.secondary" sx={{ pl: 4 }}>
            When enabled, newly registered users are put in a pending state and must be manually activated by an administrator before they can access core repository features. When disabled (default), new accounts are instantly activated with standard USER privileges.
          </Typography>
        </Box>
      </Paper>
      {/* Form Action Controls */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isPending}
          sx={{ minWidth: 200, py: 1.5, borderRadius: 3, fontWeight: "bold", textTransform: "none" }}
        >
          {isPending ? "Saving Settings..." : "Save Configuration"}
        </Button>
      </Box>
    </Box>
  );
}
