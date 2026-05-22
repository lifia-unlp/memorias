import { createTheme, Theme } from "@mui/material/styles";

// Common typography and shape configuration
const commonThemeSettings = {
  typography: {
    fontFamily: [
      "Roboto",
      "Outfit",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(","),
    h1: {
      fontFamily: "Outfit, Roboto, sans-serif",
      fontWeight: 800,
      fontSize: "2.25rem",
      letterSpacing: "-0.02em",
      lineHeight: 1.25,
    },
    h2: {
      fontFamily: "Outfit, Roboto, sans-serif",
      fontWeight: 800,
      fontSize: "1.75rem",
      letterSpacing: "-0.01em",
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: "Outfit, Roboto, sans-serif",
      fontWeight: 700,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "0.925rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.815rem",
      lineHeight: 1.5,
    },
    button: {
      fontFamily: "Outfit, Roboto, sans-serif",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      fontSize: "0.815rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
};

// Common component style overrides
const getComponentOverrides = (isDark: boolean) => ({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
          boxShadow: isDark
            ? "0px 2px 4px rgba(0, 0, 0, 0.4)"
            : "0px 1px 3px rgba(9, 58, 84, 0.05), 0px 1px 2px rgba(9, 58, 84, 0.1)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: isDark
              ? "0px 4px 12px rgba(0, 0, 0, 0.6)"
              : "0px 4px 6px -1px rgba(9, 58, 84, 0.08), 0px 2px 4px -1px rgba(9, 58, 84, 0.05)",
            borderColor: isDark ? "#334155" : "#94a3b8",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          textTransform: "none" as const,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined" as const,
        size: "medium" as const,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export type ThemeMode = "light" | "dark" | "lifia" | "custom";

export interface CustomColors {
  primary: string;
  secondary: string;
}

export function buildAppTheme(mode: ThemeMode, customColors?: CustomColors): Theme {
  let palette: any = {};

  switch (mode) {
    case "dark":
      palette = {
        mode: "dark",
        primary: {
          main: "#90caf9",
          dark: "#42a5f5",
          light: "rgba(144, 202, 249, 0.08)",
        },
        secondary: {
          main: "#f48fb1",
          dark: "#ab47bc",
          light: "rgba(244, 143, 177, 0.08)",
        },
        background: {
          default: "#0b0f19",
          paper: "#141c2f",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          disabled: "#475569",
        },
        divider: "#1e293b",
      };
      break;

    case "lifia":
      palette = {
        mode: "light",
        primary: {
          main: "#093A54",
          dark: "#072e43",
          light: "rgba(9, 58, 84, 0.08)",
        },
        secondary: {
          main: "#E56226",
          dark: "#cc521d",
          light: "rgba(229, 98, 38, 0.08)",
        },
        background: {
          default: "#f8fafc",
          paper: "#ffffff",
        },
        text: {
          primary: "#0f172a",
          secondary: "#64748b",
          disabled: "#cbd5e1",
        },
        divider: "#e2e8f0",
      };
      break;

    case "custom":
      const pColor = customColors?.primary || "#00bcd4";
      const sColor = customColors?.secondary || "#ff4081";
      palette = {
        mode: "light",
        primary: {
          main: pColor,
          light: `${pColor}14`, // ~8% opacity
        },
        secondary: {
          main: sColor,
          light: `${sColor}14`,
        },
        background: {
          default: "#f8fafc",
          paper: "#ffffff",
        },
        text: {
          primary: "#1e293b",
          secondary: "#64748b",
          disabled: "#cbd5e1",
        },
        divider: "#e2e8f0",
      };
      break;

    case "light":
    default:
      palette = {
        mode: "light",
        primary: {
          main: "#1976d2",
          dark: "#1565c0",
          light: "rgba(25, 118, 210, 0.08)",
        },
        secondary: {
          main: "#9c27b0",
          dark: "#7b1fa2",
          light: "rgba(156, 39, 176, 0.08)",
        },
        background: {
          default: "#f8fafc",
          paper: "#ffffff",
        },
        text: {
          primary: "#1e293b",
          secondary: "#64748b",
          disabled: "#cbd5e1",
        },
        divider: "#e2e8f0",
      };
      break;
  }

  return createTheme({
    ...commonThemeSettings,
    palette,
    ...getComponentOverrides(mode === "dark"),
  });
}
