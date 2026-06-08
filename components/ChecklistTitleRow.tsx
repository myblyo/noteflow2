import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";

import { useThemeColors } from "../hooks/useTheme";
import { spacing } from "../constants/theme";
import { sharedStyles } from "../constants/sharedStyles";
import type { ChecklistNote } from "../types";
import { ChecklistProgressBar } from "./ChecklistProgressBar";

interface ChecklistTitleRowProps {
  checklist: ChecklistNote;
  onPress?: () => void;
}

export function ChecklistTitleRow({ checklist, onPress }: ChecklistTitleRowProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      disabled={!onPress}
    >
      <Text
        style={[sharedStyles.subtitleText, styles.title, { color: colors.accent }]}
        numberOfLines={1}
      >
        {checklist.title || "Checklist sin título"}
      </Text>
      <ChecklistProgressBar items={checklist.items} compact showLabel />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: 0,
  },
});
