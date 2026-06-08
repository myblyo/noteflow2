import React, { useState } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColors } from "../hooks/useTheme";
import { sharedStyles } from "../constants/sharedStyles";
import { radius } from "../constants/theme";

interface AddButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AddButton({ onPress, style }: AddButtonProps) {
  const colors = useThemeColors();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel="Crear nuevo"
      style={({ pressed }) => [
        sharedStyles.addButton,
        {
          alignSelf: "flex-start",
          padding: 8,
          borderRadius: radius.full,
          backgroundColor:
            hovered || pressed ? colors.accentLight : "transparent",
        },
        style,
      ]}
    >
      {({ pressed }) => (
        <Ionicons
          name="add"
          size={24}
          color={hovered || pressed ? colors.accent : colors.textPrimary}
        />
      )}
    </Pressable>
  );
}
