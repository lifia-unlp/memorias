"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
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
    primary: "#00bcd4",
    secondary: "#ff4081",
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

  // Render a baseline theme during server rendering to prevent blank flashes
  // Once mounted, it will correctly hydrate with the user's local settings
  return (
    <ThemeContext.Provider value={{ themeMode, customColors, setThemeMode, setCustomColors }}>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
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
