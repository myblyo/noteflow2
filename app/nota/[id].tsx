import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing, radius, typography } from "../../constants/theme";

import { Alert } from "react-native";
import { useHaptics } from "../../hooks/useHaptics"

export default function NotaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  const note = store.notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");

  const haptics = useHaptics();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note?.id]);

  const handleSave = () => {
    if (!id) return;
    store.updateNote(id, {
      title: title.trim(),
      content: content.trim(),
    });
  };

  const handleDelete = (id: string, type: "note" | "checklist" | "idea") => {
    haptics.warning();
    Alert.alert(
      "Eliminar",
      "¿Seguro que quieres eliminar esto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            haptics.success();
            if (type === "note") store.deleteNote(id);
            if (type === "checklist") store.deleteChecklist(id);
            if (type === "idea") store.deleteIdea(id);
          },
        },
      ]
    );
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString();

  if (!note) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nota no encontrada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { handleSave(); router.back(); }} hitSlop={8}>
          <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable onPress={() => store.toggleNoteFavorite(id!)} hitSlop={8} style={styles.headerBtn}>
            <Ionicons
              name={note.isFavorite ? "star" : "star-outline"}
              size={22}
              color={note.isFavorite ? colors.accent : colors.textPrimary}
            />
          </Pressable>
          <Pressable onPress={() => handleDelete(id!, "note")} hitSlop={8} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        </View>
      </View>

      {/* Editor */}
      <ScrollView
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContainer}
        keyboardDismissMode="interactive"
      >
        <TextInput
          style={[styles.titleInput, { color: colors.textPrimary }]}
          placeholder="Título..."
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          onBlur={handleSave}
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />
        <TextInput
          style={[styles.contentInput, { color: colors.textPrimary }]}
          placeholder="Escribe aquí..."
          placeholderTextColor={colors.textTertiary}
          value={content}
          onChangeText={setContent}
          onBlur={handleSave}
          multiline
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />
      </ScrollView>

      {/* Footer meta */}
      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Creada: {formatDate(note.createdAt)}
        </Text>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Editada: {formatDate(note.updatedAt)}
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  headerBtn: {
    padding: spacing.xs,
  },
  editorScroll: {
    flex: 1,
  },
  editorContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  titleInput: {
    ...typography.title,
    fontSize: 32,
    marginBottom: spacing.lg,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
  contentInput: {
    flex: 1,
    ...typography.body,
    fontSize: 17,
    lineHeight: 26,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
    minHeight: 200,
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
