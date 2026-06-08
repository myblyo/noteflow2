import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { useThemeColors } from "../hooks/useTheme";
import { goBack } from "../utils/navigation";

interface BackButtonProps {
  fallback: Href;
  onPressBefore?: () => void;
  icon?: "chevron-back" | "close";
  style?: StyleProp<ViewStyle>;
}

export function BackButton({
  fallback,
  onPressBefore,
  icon = "chevron-back",
  style,
}: BackButtonProps) {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        onPressBefore?.();
        goBack(router, fallback);
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      style={style}
    >
      <Ionicons name={icon} size={28} color={colors.textPrimary} />
    </Pressable>
  );
}
