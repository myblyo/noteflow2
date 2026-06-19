import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { ModalShell } from "../../components/ModalShell";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BackButton } from "../../components/BackButton";
import { DETAIL_FALLBACKS } from "../../utils/routes";
import { goBack } from "../../utils/navigation";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing, radius, typography } from "../../constants/theme";
import { ChecklistProgressBar } from "../../components/ChecklistProgressBar";
import { ChecklistItemRow } from "../../components/ChecklistItemRow";
import { getChecklistProgress } from "../../utils/checklistProgress";
import { PageTransition } from "../../components/PageTransition";

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

  const handleAddTask = async () => {
    if (!id || !checklist || !newTaskText.trim()) return;
    await store.addChecklistItem(id, newTaskText.trim());
    setNewTaskText("");
  };

  const handleDelete = () => {
    if (!id) return;
    store.deleteChecklist(id);
    goBack(router, DETAIL_FALLBACKS.checklist);
  };

  if (!checklist) {
    return (
      <PageTransition variant="stack">
      <ModalShell style={styles.root}>
        <View style={styles.header}>
          <BackButton fallback={DETAIL_FALLBACKS.checklist} icon="close" />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Checklist no encontrado
          </Text>
        </View>
      </ModalShell>
      </PageTransition>
    );
  }

  const { completed, total } = getChecklistProgress(checklist.items);

  return (
    <PageTransition variant="stack">
    <ModalShell style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton fallback={DETAIL_FALLBACKS.checklist} onPressBefore={handleSaveTitle} />

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

      <View style={[styles.progressContainer, { paddingHorizontal: spacing.xl }]}>
        <ChecklistProgressBar items={checklist.items} showLabel={false} />
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {completed}/{total} completados
        </Text>
      </View>

      {/* Items */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="interactive"
      >
        {checklist.items.map((item) => (
          <ChecklistItemRow key={item.id} checklistId={checklist.id} item={item} />
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
          Creada: {new Date(checklist.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Editada: {new Date(checklist.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </ModalShell>
    </PageTransition>
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
    gap: spacing.sm,
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
