import React, { useState } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColors } from "../hooks/useTheme";
import { radius, spacing } from "../constants/theme";

interface TrashButtonProps {
  onPress: () => void;
  size?: number;
  active?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TrashButton({
  onPress,
  size = 20,
  active = false,
  disabled = false,
  style,
}: TrashButtonProps) {
  const colors = useThemeColors();
  const [hovered, setHovered] = useState(false);

  const isRed = active || hovered;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel="Eliminar"
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: radius.full,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.4 : 1,
          backgroundColor:
            isRed || pressed ? "rgba(239, 68, 68, 0.12)" : "transparent",
        },
        style,
      ]}
    >
      <Ionicons
        name="trash-outline"
        size={size}
        color={isRed ? colors.error : colors.textPrimary}
      />
    </Pressable>
  );
}
