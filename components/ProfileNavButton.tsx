import React from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useThemeColors } from "../hooks/useTheme";
import { radius } from "../constants/theme";
import { useAuthStore } from "../store/authStore";
import { RemoteImage } from "./RemoteImage";

type ProfileNavButtonProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function ProfileNavButton({ size = 40, style }: ProfileNavButtonProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const avatarUrl = useAuthStore((s) => s.user?.avatarUrl);
  const iconSize = Math.max(20, Math.round(size * 0.55));

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
      {avatarUrl ? (
        <RemoteImage
          uri={avatarUrl}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          contentFit="cover"
          recyclingKey={avatarUrl}
          showLoading={false}
          showErrorOverlay={false}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={iconSize} color={colors.accent} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
});
