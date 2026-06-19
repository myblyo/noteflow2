import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { ModalShell } from "../../components/ModalShell";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BackButton } from "../../components/BackButton";
import { DETAIL_FALLBACKS } from "../../utils/routes";
import { goBack } from "../../utils/navigation";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing, radius, typography } from "../../constants/theme";
import { scrollContentGutter, scrollViewProps, scrollViewWebStyle } from "../../constants/sharedStyles";
import { FavoriteStarButton } from "../../components/FavoriteStarButton";
import { formatDate } from "../../utils/formatDate";
import { PageTransition } from "../../components/PageTransition";
import { IdeaColorPicker } from "../../components/IdeaColorPicker";
import { IdeaColorDot } from "../../components/IdeaColorDot";
import { resolveIdeaColorLabel } from "../../constants/ideaColors";

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  const idea = store.ideas.find((i) => i.id === id);
  const ideaColorLabels = useNotesStore((s) => s.ideaColorLabels);

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
    goBack(router, DETAIL_FALLBACKS.idea);
  };

  if (!idea) {
    return (
      <PageTransition variant="stack">
      <ModalShell style={styles.root}>
        <View style={styles.header}>
          <BackButton fallback={DETAIL_FALLBACKS.idea} icon="close" />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Idea no encontrada
          </Text>
        </View>
      </ModalShell>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="stack">
    <ModalShell style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton fallback={DETAIL_FALLBACKS.idea} onPressBefore={handleSave} />

        <View style={styles.headerActions}>
          <FavoriteStarButton
            isFavorite={idea.isFavorite}
            onPress={() => store.toggleIdeaFavorite(id!)}
            size={22}
            style={styles.headerBtn}
          />
          <Pressable onPress={handleDelete} hitSlop={8} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={[styles.editorScroll, scrollViewWebStyle]}
        contentContainerStyle={[styles.editorContainer, scrollContentGutter]}
        {...scrollViewProps}
      >
        <View style={styles.colorHeader}>
          <IdeaColorDot color={idea.color} size={32} />
          <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>
            {resolveIdeaColorLabel(idea.color, ideaColorLabels)}
          </Text>
        </View>

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
          scrollEnabled={false}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />

        <IdeaColorPicker
          selectedColor={idea.color}
          onSelectColor={(hex) => store.updateIdea(id as string, { color: hex })}
        />

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
          Creada: {formatDate(idea.createdAt)}
        </Text>
      </View>
    </ModalShell>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
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
    minHeight: 0,
  },
  editorContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  colorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  colorLabel: {
    ...typography.subtitle,
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
