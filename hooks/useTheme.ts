import { useColorScheme } from "react-native";

import { useThemeStore } from "../store/themeStore";
import {
  lightColors,
  darkColors,
  type ThemeColors,
  type ThemeMode,
} from "../constants/theme";

/**
 * Returns the resolved color palette based on the user's preference
 * ("light" | "dark" | "system").
 *
 * Usage:
 *   const colors = useThemeColors();
 */
export function useThemeColors(): ThemeColors {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme(); // "light" | "dark" | null

  const resolved: "light" | "dark" =
    mode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : mode;

  return resolved === "dark" ? darkColors : lightColors;
}

/**
 * Returns whether the current resolved theme is dark.
 */
export function useIsDark(): boolean {
  const colors = useThemeColors();
  return colors === darkColors;
}

/**
 * Returns { mode, setMode, colors, isDark } – a convenience bundle.
 */
export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const colors = useThemeColors();
  const isDark = colors === darkColors;

  return { mode, setMode, colors, isDark } as const;
}
