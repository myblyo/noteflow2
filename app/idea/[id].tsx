import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing, radius, typography } from "../../constants/theme";

const IDEA_COLORS = ["#6366F1", "#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#14B8A6"];

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  const idea = store.ideas.find((i) => i.id === id);

  const [title, setTitle] = useState(idea?.title ?? "");
  const [description, setDescription] = useState(idea?.description ?? "");

  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setDescription(idea.description ?? "");
    }
  }, [idea?.id]);

  const handleSave = () => {
    if (!id || !idea) return;
    store.updateIdea(id, {
      title: title.trim(),
      description: description.trim(),
    });
  };

  const handleDelete = () => {
    if (!id) return;
    store.deleteIdea(id);
    router.back();
  };

  if (!idea) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Idea no encontrada
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
          <Pressable onPress={() => store.toggleIdeaFavorite(id!)} hitSlop={8} style={styles.headerBtn}>
            <Ionicons
              name={idea.isFavorite ? "star" : "star-outline"}
              size={22}
              color={idea.isFavorite ? colors.accent : colors.textPrimary}
            />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={8} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContainer}
      >
        {/* Color indicator */}
        <View style={[styles.colorBadge, { backgroundColor: idea.color }]} />

        <TextInput
          style={[styles.titleInput, { color: colors.textPrimary }]}
          placeholder="Título de la idea..."
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          onBlur={handleSave}
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />

        <TextInput
          style={[styles.descriptionInput, { color: colors.textPrimary }]}
          placeholder="Descripción..."
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          onBlur={handleSave}
          multiline
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />

        {/* Color picker */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Color</Text>
        <View style={styles.colorRow}>
          {IDEA_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => store.updateIdea(id as string, { color: c })}
              style={[
                styles.colorCircle,
                { backgroundColor: c },
                idea.color === c && { borderWidth: 3, borderColor: colors.textPrimary },
              ]}
            />
          ))}
        </View>

        {/* Tags */}
        {idea.tags.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tags</Text>
            <View style={styles.tagsRow}>
              {idea.tags.map((tag) => (
                <View key={tag} style={[styles.tagPill, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.tagText, { color: colors.accent }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer meta */}
      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Creada: {idea.createdAt.toLocaleDateString()}
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
  colorBadge: {
    width: 48,
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.lg,
  },
  titleInput: {
    ...typography.title,
    fontSize: 28,
    marginBottom: spacing.md,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
  descriptionInput: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
    minHeight: 120,
  },
  sectionLabel: {
    ...typography.subtitle,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  colorRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tagsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  tagText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "500",
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
