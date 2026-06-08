import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

import { useNotesStore } from "../store/noteStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";
import {
  IDEA_COLOR_OPTIONS,
  resolveIdeaColorLabel,
} from "../constants/ideaColors";

interface IdeaColorPickerProps {
  selectedColor: string;
  onSelectColor: (hex: string) => void;
}

export function IdeaColorPicker({ selectedColor, onSelectColor }: IdeaColorPickerProps) {
  const colors = useThemeColors();
  const ideaColorLabels = useNotesStore((s) => s.ideaColorLabels);
  const setIdeaColorLabel = useNotesStore((s) => s.setIdeaColorLabel);

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        Color y significado
      </Text>
      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        Elige un color y edita su nombre para organizar tus ideas.
      </Text>

      <View style={styles.grid}>
        {IDEA_COLOR_OPTIONS.map((option) => {
          const isSelected = selectedColor === option.hex;
          const label = resolveIdeaColorLabel(option.hex, ideaColorLabels);

          return (
            <View key={option.hex} style={styles.item}>
              <Pressable
                onPress={() => onSelectColor(option.hex)}
                accessibilityRole="button"
                accessibilityLabel={`Color ${label}`}
                accessibilityState={isSelected ? { selected: true } : {}}
                style={[
                  styles.circle,
                  { backgroundColor: option.hex },
                  isSelected && {
                    borderWidth: 3,
                    borderColor: colors.textPrimary,
                  },
                ]}
              />
              <TextInput
                value={label}
                onChangeText={(text) => setIdeaColorLabel(option.hex, text)}
                onBlur={() => {
                  if (!label.trim()) {
                    setIdeaColorLabel(option.hex, option.defaultLabel);
                  }
                }}
                placeholder={option.defaultLabel}
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.labelInput,
                  {
                    color: colors.textPrimary,
                    borderColor: isSelected ? colors.accent : colors.divider,
                    backgroundColor: isSelected
                      ? colors.accentLight
                      : colors.surfaceTranslucent,
                  },
                ]}
                maxLength={24}
                underlineColorAndroid="transparent"
                selectionColor={colors.accent}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.subtitle,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  item: {
    width: 88,
    alignItems: "center",
    gap: spacing.sm,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  labelInput: {
    width: "100%",
    ...typography.caption,
    textAlign: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    outlineStyle: "none" as never,
  },
});
