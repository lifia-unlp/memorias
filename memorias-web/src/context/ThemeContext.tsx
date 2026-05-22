"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { buildAppTheme, ThemeMode, CustomColors } from "@/styles/theme";

interface ThemeContextType {
  themeMode: ThemeMode;
  customColors: CustomColors;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomColors: (colors: CustomColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("lifia"); // Default to institutional LIFIA
  const [customColors, setCustomColorsState] = useState<CustomColors>({
    primary: "#093A54",
    secondary: "#E56226",
  });
  const [mounted, setMounted] = useState(false);

  // Load preferences on client mount
  useEffect(() => {
    try {
      const storedMode = localStorage.getItem("memorias-theme-mode") as ThemeMode;
      if (storedMode && ["light", "dark", "lifia", "custom"].includes(storedMode)) {
        setThemeModeState(storedMode);
      }
      const storedColors = localStorage.getItem("memorias-custom-colors");
      if (storedColors) {
        setCustomColorsState(JSON.parse(storedColors));
      }
    } catch (e) {
      console.error("Failed to load theme preferences:", e);
    }
    setMounted(true);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem("memorias-theme-mode", mode);
    } catch (e) {
      console.error("Failed to save theme mode:", e);
    }
  };

  const setCustomColors = (colors: CustomColors) => {
    setCustomColorsState(colors);
    try {
      localStorage.setItem("memorias-custom-colors", JSON.stringify(colors));
    } catch (e) {
      console.error("Failed to save custom colors:", e);
    }
  };

  // Build the dynamic theme
  const activeTheme = buildAppTheme(themeMode, customColors);

  // Synchronize dynamic theme colors with documentElement CSS variables on the client side.
  // This guarantees that CSS variable references like var(--mui-palette-primary-main) used
  // in gradients or components immediately and cleanly update when the theme mode changes.
  useEffect(() => {
    if (!mounted) return;

    try {
      const root = document.documentElement;
      const palette = activeTheme.palette;

      if (palette.primary?.main) {
        root.style.setProperty("--mui-palette-primary-main", palette.primary.main);
      }
      if (palette.primary?.dark) {
        root.style.setProperty("--mui-palette-primary-dark", palette.primary.dark);
      }
      if (palette.secondary?.main) {
        root.style.setProperty("--mui-palette-secondary-main", palette.secondary.main);
      }
      if (palette.secondary?.dark) {
        root.style.setProperty("--mui-palette-secondary-dark", palette.secondary.dark);
      }
      if (palette.background?.default) {
        root.style.setProperty("--mui-palette-background-default", palette.background.default);
      }
      if (palette.background?.paper) {
        root.style.setProperty("--mui-palette-background-paper", palette.background.paper);
      }
      if (palette.text?.primary) {
        root.style.setProperty("--mui-palette-text-primary", palette.text.primary);
      }
      if (palette.text?.secondary) {
        root.style.setProperty("--mui-palette-text-secondary", palette.text.secondary);
      }
      if (palette.divider) {
        root.style.setProperty("--mui-palette-divider", palette.divider);
      }
    } catch (e) {
      console.error("Failed to synchronize theme CSS variables:", e);
    }
  }, [activeTheme, mounted]);

  // Render a baseline theme during server rendering to prevent blank flashes
  // Once mounted, it will correctly hydrate with the user's local settings
  return (
    <ThemeContext.Provider value={{ themeMode, customColors, setThemeMode, setCustomColors }}>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        <Box
          sx={{
            bgcolor: "background.default",
            color: "text.primary",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeContextProvider");
  }
  return context;
}
