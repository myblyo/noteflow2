import React, { useState } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../hooks/useTheme";
import { radius } from "../constants/theme";

interface ThemeToggleButtonProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function ThemeToggleButton({ size = 20, style }: ThemeToggleButtonProps) {
  const { isDark, setMode, colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  const toggle = () => setMode(isDark ? "light" : "dark");

  return (
    <Pressable
      onPress={toggle}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            hovered || pressed ? colors.accentLight : colors.surfaceTranslucent,
        },
        style,
      ]}
    >
      <Ionicons
        name={isDark ? "sunny" : "moon"}
        size={size}
        color={hovered || isDark ? colors.accent : colors.textPrimary}
      />
    </Pressable>
  );
}
