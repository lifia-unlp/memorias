"use client";

import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";
import { updateUserPreferences } from "./actions";

interface PreferencesClientProps {
  session: any;
}

export default function PreferencesClient({ session }: PreferencesClientProps) {
  const { themeMode, customColors, setThemeMode, setCustomColors } = useAppTheme();

  // Form states
  const [displayName] = useState(session?.user?.name || "John Smith");
  const [email] = useState(session?.user?.email || "jsmith@lifia.info.unlp.edu.ar");
  
  const [notificationEmail, setNotificationEmail] = useState(
    session?.user?.notificationEmail || ""
  );
  const [avatarUrl, setAvatarUrl] = useState(
    session?.user?.avatarUrl || ""
  );
  const [digestEmails, setDigestEmails] = useState(
    session?.user?.digestEmails !== undefined ? session.user.digestEmails : true
  );
  const [immediateNotifications, setImmediateNotifications] = useState(
    session?.user?.immediateNotifications !== undefined ? session.user.immediateNotifications : true
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.set("notificationEmail", notificationEmail);
      formData.set("avatarUrl", avatarUrl);
      formData.set("digestEmails", String(digestEmails));
      formData.set("immediateNotifications", String(immediateNotifications));

      const res = await updateUserPreferences(formData);
      if (res && !res.success) {
        setSaveError(res.error || "Failed to update preferences.");
      } else {
        setSaveSuccess(true);
        // Force refresh to reload NextAuth JWT session changes
        window.location.reload();
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to save user preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header section */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: "0.675rem",
              textTransform: "uppercase",
              color: "secondary.main",
              letterSpacing: "1px",
              display: "block",
              mb: 0.5,
            }}
          >
            Personalization
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "1.75rem", md: "2.25rem" },
              fontWeight: 800,
              color: "text.primary",
              mb: 1.5,
            }}
          >
            User Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem", maxW: 500, mx: "auto" }}>
            Customize your curator settings, bibliography styles, and notification alerts.
          </Typography>
        </Box>

        {saveError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {saveError}
          </Alert>
        )}
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Preferences saved successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Account Credentials */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1, color: "primary.main" }}>
                Account & Preferences Settings
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={displayName}
                    slotProps={{ input: { readOnly: true } }}
                    helperText="Identity provider name (Read-Only)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Primary Login Email Address"
                    type="email"
                    value={email}
                    slotProps={{ input: { readOnly: true } }}
                    helperText="Identity provider email (Read-Only)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Notification Email Address"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    helperText="Defaults to your login email if left empty."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Custom Avatar URL"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    helperText="Paste a URL to set a custom profile avatar."
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Theme selector */}
            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1, color: "primary.main" }}>
                Interface Customization (Themes)
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.75, display: "block" }}>
                      Theme Mode
                    </Typography>
                    <Select
                      value={themeMode}
                      onChange={(e) => setThemeMode(e.target.value as any)}
                    >
                      <MenuItem value="lifia" sx={{ fontSize: "0.85rem" }}>LIFIA Institutional Style</MenuItem>
                      <MenuItem value="light" sx={{ fontSize: "0.85rem" }}>Standard Light Mode</MenuItem>
                      <MenuItem value="dark" sx={{ fontSize: "0.85rem" }}>Standard Dark Mode</MenuItem>
                      <MenuItem value="custom" sx={{ fontSize: "0.85rem" }}>Custom Color Palette</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Color pickers for Custom Theme */}
                {themeMode === "custom" && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display: "block" }}>
                        Click to select colors:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <input
                            type="color"
                            id="primary-color-input"
                            value={customColors.primary}
                            onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                            style={{
                              border: "none",
                              width: 32,
                              height: 32,
                              borderRadius: 4,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Primary
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <input
                            type="color"
                            id="secondary-color-input"
                            value={customColors.secondary}
                            onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                            style={{
                              border: "none",
                              width: 32,
                              height: 32,
                              borderRadius: 4,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Secondary
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Notifications Settings */}
            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1, color: "primary.main" }}>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={digestEmails}
                      onChange={(e) => setDigestEmails(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 650, color: "text.primary" }}>
                      Send me digest emails of new updates and research activity
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={immediateNotifications}
                      onChange={(e) => setImmediateNotifications(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 650, color: "text.primary" }}>
                      Notify me immediately of any changes to the elements I am linked to
                    </Typography>
                  }
                />
              </Box>
            </Grid>

            {/* Actions */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  component="a"
                  href="/"
                  variant="outlined"
                  sx={{ minWidth: 100 }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 150 }}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
