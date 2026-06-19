/**
 * Noteflow2 – Design tokens & color palettes based on Figma
 */

// ─── Color palettes ──────────────────────────────────────────────

export const lightColors = {
  // Surfaces
  background: "#FFFFFF", // App root background (assuming white based on mockup)
  surface: "#FFFFFF", // Used for active elements
  surfaceSecondary: "#F5F5F5", // --bg-light
  surfaceTranslucent: "rgba(255, 255, 255, 0.6)", // Modified from 0.07 to 0.6 for visibility on light gray, or we can use pure white. Let's stick to a solid white or highly opaque white for RN.

  // Text
  textPrimary: "#1D1B20", // --text-dark
  textSecondary: "rgba(60, 60, 67, 0.6)", // --text-medium
  textTertiary: "rgba(60, 60, 67, 0.4)",
  textInverse: "#FFFFFF",

  // Brand / Accent
  accent: "#0088FF", // --accent-blue
  accentLight: "#E5F3FF", // Light version for active backgrounds
  accentDark: "#0066CC",

  // Semantic
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#0088FF",

  // Borders & Dividers
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  divider: "rgba(60, 60, 67, 0.1)",

  // Misc
  shadowSoft: "rgba(0, 0, 0, 0.05)", // --shadow-soft
  overlay: "rgba(0, 0, 0, 0.4)",
  cardShadow: "rgba(0, 0, 0, 0.05)",

  // Tab bar
  tabBar: "#FFFFFF",
  tabBarBorder: "#E5E7EB",
  tabActive: "#0088FF",
  tabInactive: "rgba(60, 60, 67, 0.6)",

  // Status bar
  statusBarStyle: "dark" as const,
} as const;

export const darkColors = {
  // Surfaces
  background: "#000000",
  surface: "#1D1B20",
  surfaceSecondary: "#121212",
  surfaceTranslucent: "rgba(255, 255, 255, 0.07)", // Original Figma translucent

  // Text
  textPrimary: "#F5F5F5",
  textSecondary: "rgba(235, 235, 245, 0.6)",
  textTertiary: "rgba(235, 235, 245, 0.4)",
  textInverse: "#1D1B20",

  // Brand / Accent
  accent: "#0088FF",
  accentLight: "rgba(0, 136, 255, 0.2)",
  accentDark: "#66B2FF",

  // Semantic
  success: "#4ADE80",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",

  // Borders & Dividers
  border: "#334155",
  borderLight: "#1E293B",
  divider: "rgba(255, 255, 255, 0.1)",

  // Misc
  shadowSoft: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(0, 0, 0, 0.6)",
  cardShadow: "rgba(0, 0, 0, 0.2)",

  // Tab bar
  tabBar: "#1E293B",
  tabBarBorder: "#334155",
  tabActive: "#0088FF",
  tabInactive: "rgba(235, 235, 245, 0.6)",

  // Status bar
  statusBarStyle: "light" as const,
} as const;

// ─── Type export ─────────────────────────────────────────────────

/** Structural type that both lightColors and darkColors satisfy. */
export type ThemeColors = {
  [K in keyof typeof lightColors]: K extends "statusBarStyle"
    ? "light" | "dark"
    : string;
};

export type ThemeMode = "light" | "dark" | "system";

// ─── Spacing & Radius ────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 6,   // checkbox
  md: 12,  // btn
  lg: 24,  // list-item, bar
  xl: 28,  // list-container, card
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────

import { Platform } from "react-native";

/** Fuente sans-serif del sistema en web (evita Times New Roman en inputs/editores). */
export const WEB_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const fontStack = Platform.select({
  ios: "System",
  android: "Roboto",
  default: WEB_FONT_STACK,
});

export const typography = {
  title: { fontFamily: fontStack, fontSize: 22, fontWeight: "600" as const },      // Panel titles
  subtitle: { fontFamily: fontStack, fontSize: 16, fontWeight: "500" as const },   // Item titles
  body: { fontFamily: fontStack, fontSize: 14, fontWeight: "400" as const },       // Item descriptions
  button: { fontFamily: fontStack, fontSize: 14, fontWeight: "600" as const },
  // Keeping these for backwards compatibility with other screens
  h1: { fontFamily: fontStack, fontSize: 28, fontWeight: "700" as const, lineHeight: 34 },
  h2: { fontFamily: fontStack, fontSize: 22, fontWeight: "600" as const, lineHeight: 28 },
  h3: { fontFamily: fontStack, fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  bodyMedium: { fontFamily: fontStack, fontSize: 15, fontWeight: "500" as const, lineHeight: 22 },
  caption: { fontFamily: fontStack, fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
} as const;
