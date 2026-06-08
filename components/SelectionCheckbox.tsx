import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColors } from "../hooks/useTheme";
import { sharedStyles } from "../constants/sharedStyles";
import { spacing } from "../constants/theme";

interface SelectionCheckboxProps {
  selected: boolean;
}

export function SelectionCheckbox({ selected }: SelectionCheckboxProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        sharedStyles.checkbox,
        {
          borderColor: selected ? colors.accent : colors.textPrimary,
          backgroundColor: selected ? colors.accent : "transparent",
          marginRight: spacing.sm,
        },
      ]}
    >
      {selected && <Ionicons name="checkmark" size={16} color={colors.surface} />}
    </View>
  );
}
