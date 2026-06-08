import React from "react";
import { View, Text, Pressable, StyleSheet, Alert, Platform } from "react-native";

import { useNotesStore } from "../store/noteStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";
import { TrashButton } from "./TrashButton";

export function SelectionBar() {
  const colors = useThemeColors();
  const { toolbarContainer } = useResponsive();
  const selectionMode = useNotesStore((s) => s.selectionMode);
  const selectedItems = useNotesStore((s) => s.selectedItems);
  const exitSelectionMode = useNotesStore((s) => s.exitSelectionMode);
  const deleteSelectedItems = useNotesStore((s) => s.deleteSelectedItems);

  if (!selectionMode) return null;

  const count = selectedItems.length;

  const handleDelete = () => {
    if (count === 0) return;

    const message =
      count === 1
        ? "¿Seguro que quieres eliminar este elemento?"
        : `¿Seguro que quieres eliminar ${count} elementos?`;

    const onConfirm = () => deleteSelectedItems();

    if (Platform.OS === "web") {
      if (window.confirm(message)) onConfirm();
      return;
    }

    Alert.alert("Eliminar", message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: onConfirm },
    ]);
  };

  return (
    <View style={toolbarContainer}>
    <View style={[styles.bar, { backgroundColor: colors.surfaceSecondary }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {count === 0
          ? "Selecciona elementos para eliminar"
          : `${count} seleccionado${count === 1 ? "" : "s"}`}
      </Text>

      <View style={styles.actions}>
        <Pressable onPress={exitSelectionMode} hitSlop={8}>
          <Text style={[styles.cancel, { color: colors.textPrimary }]}>Cancelar</Text>
        </Pressable>
        <TrashButton
          onPress={handleDelete}
          active={count > 0}
          disabled={count === 0}
          size={18}
          style={styles.trash}
        />
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  label: {
    ...typography.body,
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cancel: {
    ...typography.subtitle,
    fontSize: 14,
    paddingHorizontal: spacing.sm,
  },
  trash: {
    width: 36,
    height: 36,
  },
});
