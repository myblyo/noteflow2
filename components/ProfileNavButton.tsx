import React from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useThemeColors } from "../hooks/useTheme";
import { radius } from "../constants/theme";

type ProfileNavButtonProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function ProfileNavButton({ size = 40, style }: ProfileNavButtonProps) {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/perfil")}
      accessibilityRole="button"
      accessibilityLabel="Perfil"
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor: pressed ? colors.accentLight : colors.surfaceTranslucent,
        },
        style,
      ]}
    >
      <Ionicons name="person-circle-outline" size={24} color={colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
