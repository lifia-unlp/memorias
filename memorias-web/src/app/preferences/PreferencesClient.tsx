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
} from "@mui/material";
import { useAppTheme } from "@/context/ThemeContext";

interface PreferencesClientProps {
  session: any;
}

export default function PreferencesClient({ session }: PreferencesClientProps) {
  const { themeMode, customColors, setThemeMode, setCustomColors } = useAppTheme();

  // Form states
  const [displayName, setDisplayName] = useState(session?.user?.name || "John Smith");
  const [email, setEmail] = useState(session?.user?.email || "jsmith@lifia.info.unlp.edu.ar");
  const [citationStyle, setCitationStyle] = useState("apa");
  const [language, setLanguage] = useState("en");
  const [digestEmails, setDigestEmails] = useState(true);
  const [defenseAlerts, setDefenseAlerts] = useState(true);
  const [fundingAlerts, setFundingAlerts] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Preferences updated successfully!");
  };

  return (
    <Container maxWidth="md" sx={{ py: 6, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Account Credentials */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1, color: "primary.main" }}>
                Account Credentials
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Curation Styles */}
            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, mb: 1, color: "primary.main" }}>
                Curation Styles
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.75, display: "block" }}>
                      Default Citation View
                    </Typography>
                    <Select
                      value={citationStyle}
                      onChange={(e) => setCitationStyle(e.target.value)}
                    >
                      <MenuItem value="apa" sx={{ fontSize: "0.85rem" }}>APA Style</MenuItem>
                      <MenuItem value="ieee" sx={{ fontSize: "0.85rem" }}>IEEE Style</MenuItem>
                      <MenuItem value="bibtex" sx={{ fontSize: "0.85rem" }}>Raw BibTeX Structure</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.75, display: "block" }}>
                      UI Language
                    </Typography>
                    <Select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <MenuItem value="en" sx={{ fontSize: "0.85rem" }}>English (US)</MenuItem>
                      <MenuItem value="es" sx={{ fontSize: "0.85rem" }}>Spanish (Castellano)</MenuItem>
                    </Select>
                  </FormControl>
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
                Notifications Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
                      Send me digest emails of new publications added by the laboratory
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={defenseAlerts}
                      onChange={(e) => setDefenseAlerts(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 650, color: "text.primary" }}>
                      Alert me when thesis defenses are scheduled in the portal
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={fundingAlerts}
                      onChange={(e) => setFundingAlerts(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 650, color: "text.primary" }}>
                      Send me warning emails about project funding expiration dates
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 150 }}
                >
                  Save Preferences
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
