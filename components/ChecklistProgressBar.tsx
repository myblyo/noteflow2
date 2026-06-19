import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";
import type { ChecklistItem } from "../types";
import { getChecklistProgress } from "../utils/checklistProgress";

interface ChecklistProgressBarProps {
  items: ChecklistItem[];
  /** Barra de ancho completo en listas */
  compact?: boolean;
  showLabel?: boolean;
}

export function ChecklistProgressBar({
  items,
  compact = false,
  showLabel = true,
}: ChecklistProgressBarProps) {
  const colors = useThemeColors();
  const { completed, total, ratio } = getChecklistProgress(items);

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View
        style={[
          styles.track,
          compact ? styles.trackCompact : styles.trackFull,
          { backgroundColor: colors.textTertiary },
        ]}
      >
        {ratio > 0 && (
          <View
            style={[
              styles.fill,
              compact ? styles.fillCompact : styles.fillFull,
              {
                backgroundColor: colors.accent,
                width: `${ratio * 100}%`,
              },
            ]}
          />
        )}
      </View>
      {showLabel && (
        <Text
          style={[
            compact ? styles.labelCompact : styles.labelFull,
            { color: colors.textSecondary },
          ]}
        >
          {completed}/{total}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: spacing.sm,
  },
  wrapperCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  track: {
    overflow: "hidden",
    borderRadius: radius.full,
  },
  trackCompact: {
    flex: 1,
    height: 6,
    minWidth: 0,
  },
  trackFull: {
    height: 8,
    width: "100%",
  },
  fill: {
    borderRadius: radius.full,
  },
  fillCompact: {
    height: 6,
  },
  fillFull: {
    height: 8,
  },
  labelCompact: {
    ...typography.caption,
    fontSize: 12,
    minWidth: 32,
    textAlign: "right",
  },
  labelFull: {
    ...typography.caption,
    textAlign: "center",
  },
});
