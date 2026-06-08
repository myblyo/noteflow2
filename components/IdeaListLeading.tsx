import React from "react";
import { View, Text } from "react-native";

import { useNotesStore } from "../store/noteStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, typography } from "../constants/theme";
import { resolveIdeaColorLabel } from "../constants/ideaColors";
import { IdeaColorDot } from "./IdeaColorDot";

interface IdeaListLeadingProps {
  color: string;
  showLabel?: boolean;
}

export function IdeaListLeading({ color, showLabel = true }: IdeaListLeadingProps) {
  const colors = useThemeColors();
  const ideaColorLabels = useNotesStore((s) => s.ideaColorLabels);
  const label = resolveIdeaColorLabel(color, ideaColorLabels);

  return (
    <View style={{ alignItems: "center", marginRight: spacing.sm, minWidth: 52 }}>
      <IdeaColorDot color={color} size={24} />
      {showLabel && (
        <Text
          style={[
            typography.caption,
            {
              color: colors.textSecondary,
              marginTop: 4,
              textAlign: "center",
              maxWidth: 52,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
