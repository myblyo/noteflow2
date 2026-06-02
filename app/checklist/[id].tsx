import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing, radius, typography } from "../../constants/theme";
import { sharedStyles } from "../../constants/sharedStyles";

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  const checklist = store.checklists.find((c) => c.id === id);

  const [title, setTitle] = useState(checklist?.title ?? "");
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title);
    }
  }, [checklist?.id]);

  const handleSaveTitle = () => {
    if (!id || !checklist) return;
    store.updateChecklist(id, { title: title.trim() });
  };

  const handleAddTask = () => {
    if (!id || !checklist || !newTaskText.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      task: newTaskText.trim(),
      isCompleted: false,
    };
    store.updateChecklist(id, { items: [...checklist.items, newItem] });
    setNewTaskText("");
  };

  const handleDelete = () => {
    if (!id) return;
    store.deleteChecklist(id);
    router.back();
  };

  if (!checklist) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Checklist no encontrado
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = checklist.items.filter((i) => i.isCompleted).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { handleSaveTitle(); router.back(); }} hitSlop={8}>
          <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
        </Pressable>

        <TextInput
          style={[styles.headerTitle, { color: colors.textPrimary }]}
          value={title}
          onChangeText={setTitle}
          onBlur={handleSaveTitle}
          placeholder="Título del checklist"
          placeholderTextColor={colors.textTertiary}
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />

        <Pressable onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressContainer, { paddingHorizontal: spacing.xl }]}>
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSecondary }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.accent,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {completedCount}/{totalCount} completados
        </Text>
      </View>

      {/* Items */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="interactive"
      >
        {checklist.items.map((item) => (
          <Pressable
            key={item.id}
            style={[sharedStyles.listItem, { backgroundColor: colors.surfaceTranslucent }]}
            onPress={() => store.toggleChecklistItem(checklist.id, item.id)}
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
            <Text
              style={[
                styles.itemText,
                {
                  color: colors.textPrimary,
                  textDecorationLine: item.isCompleted ? "line-through" : "none",
                  opacity: item.isCompleted ? 0.6 : 1,
                },
              ]}
            >
              {item.task}
            </Text>
          </Pressable>
        ))}

        {/* Add new task input */}
        <View style={[styles.addTaskRow, { backgroundColor: colors.surfaceTranslucent }]}>
          <Ionicons name="add" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.addTaskInput, { color: colors.textPrimary }]}
            placeholder="Añadir nueva tarea..."
            placeholderTextColor={colors.textTertiary}
            value={newTaskText}
            onChangeText={setNewTaskText}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
            underlineColorAndroid="transparent"
            selectionColor={colors.accent}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Creada: {checklist.createdAt.toLocaleDateString()}
        </Text>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Editada: {checklist.updatedAt.toLocaleDateString()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 20,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    textAlign: "center",
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
  itemText: {
    ...typography.subtitle,
    flex: 1,
    marginLeft: spacing.md,
  },
  addTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  addTaskInput: {
    ...typography.subtitle,
    flex: 1,
    marginLeft: spacing.sm,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    ...typography.caption,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...typography.subtitle,
  },
});
