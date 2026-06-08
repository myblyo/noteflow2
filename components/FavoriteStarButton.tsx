import React, { useState } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColors } from "../hooks/useTheme";
import { radius, spacing } from "../constants/theme";

interface FavoriteStarButtonProps {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function FavoriteStarButton({
  isFavorite,
  onPress,
  size = 20,
  style,
}: FavoriteStarButtonProps) {
  const colors = useThemeColors();
  const [hovered, setHovered] = useState(false);

  const isActive = isFavorite || hovered;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      style={({ pressed }) => [
        {
          padding: spacing.xs,
          borderRadius: radius.full,
          backgroundColor:
            hovered || pressed ? colors.accentLight : "transparent",
        },
        style,
      ]}
    >
      <Ionicons
        name={isActive ? "star" : "star-outline"}
        size={size}
        color={isActive ? colors.accent : colors.textPrimary}
      />
    </Pressable>
  );
}
