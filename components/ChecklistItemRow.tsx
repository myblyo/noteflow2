import React, { useEffect, useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { ChecklistItem } from "../types";
import { useNotesStore } from "../store/noteStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, typography } from "../constants/theme";
import { sharedStyles } from "../constants/sharedStyles";
import { TrashButton } from "./TrashButton";

interface ChecklistItemRowProps {
  checklistId: string;
  item: ChecklistItem;
}

export function ChecklistItemRow({ checklistId, item }: ChecklistItemRowProps) {
  const colors = useThemeColors();
  const store = useNotesStore();
  const [task, setTask] = useState(item.task);

  useEffect(() => {
    setTask(item.task);
  }, [item.id, item.task]);

  const saveTask = () => {
    const trimmed = task.trim();
    if (!trimmed) {
      setTask(item.task);
      return;
    }
    if (trimmed !== item.task) {
      void store.updateChecklistItemTask(checklistId, item.id, trimmed);
    }
  };

  return (
    <View
      style={[sharedStyles.listItem, { backgroundColor: colors.surfaceTranslucent }]}
    >
      <Pressable
        onPress={() => store.toggleChecklistItem(checklistId, item.id)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.isCompleted }}
      >
        <View
          style={[
            sharedStyles.checkbox,
            { borderColor: colors.textPrimary },
            item.isCompleted && { backgroundColor: colors.textPrimary },
          ]}
        >
          {item.isCompleted && (
            <Ionicons name="checkmark" size={16} color={colors.surface} />
          )}
        </View>
      </Pressable>

      <TextInput
        style={[
          styles.taskInput,
          {
            color: colors.textPrimary,
            textDecorationLine: item.isCompleted ? "line-through" : "none",
            opacity: item.isCompleted ? 0.6 : 1,
          },
        ]}
        value={task}
        onChangeText={setTask}
        onBlur={saveTask}
        onSubmitEditing={saveTask}
        underlineColorAndroid="transparent"
        selectionColor={colors.accent}
        returnKeyType="done"
      />

      <TrashButton
        onPress={() => store.removeChecklistItem(checklistId, item.id)}
        size={18}
        style={styles.deleteButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  taskInput: {
    ...typography.subtitle,
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
    paddingVertical: 0,
  },
  deleteButton: {
    width: 36,
    height: 36,
  },
});
