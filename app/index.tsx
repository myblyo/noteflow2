import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useNotesStore } from "../store/noteStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";
import type { NoteType, Note, ChecklistNote, IdeaNote } from "../types";

// ─── Seed data ──────────────────────────────────────────────────

const SEED_NOTES: Note[] = [
  {
    id: "n1",
    title: "La importancia de la tecnología en la vida cotidiana",
    content: "Description",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "n2",
    title: "Title",
    content: "Description",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "n3",
    title: "Title",
    content: "Description",
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "n4",
    title: "Title",
    content: "desc",
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_CHECKLISTS: ChecklistNote[] = [
  {
    id: "c1",
    title: "To Do",
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      { id: "ci1", task: "Title", isCompleted: true },
      { id: "ci2", task: "Title", isCompleted: true },
      { id: "ci3", task: "Title", isCompleted: true },
      { id: "ci4", task: "Title", isCompleted: true },
      { id: "ci5", task: "Title", isCompleted: true },
    ],
  },
];

const SEED_IDEAS: IdeaNote[] = [
  {
    id: "i1",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#6366F1",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "i2",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#22C55E",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "i3",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#3B82F6",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "i4",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#F59E0B",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "i5",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#EF4444",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ─── Filter tabs ────────────────────────────────────────────────

const FILTERS: { key: NoteType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "notes", label: "Notes" },
  { key: "ideas", label: "Ideas" },
  { key: "todo", label: "To Do" },
];

// ─── Main screen ────────────────────────────────────────────────

export default function DashboardScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  const [filter, setFilter] = useState<NoteType>("all");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    if (store.notes.length === 0) {
      SEED_NOTES.forEach((n) => store.addNote(n));
    }
    if (store.checklists.length === 0) {
      SEED_CHECKLISTS.forEach((c) => store.addChecklist(c));
    }
    if (store.ideas.length === 0) {
      SEED_IDEAS.forEach((i) => store.addIdea(i));
    }
  }, []);

  const selectedNote = store.notes.find((n) => n.id === store.selectedNoteId);
  useEffect(() => {
    if (selectedNote) {
      setEditorTitle(selectedNote.title);
      setEditorContent(selectedNote.content);
    } else {
      setEditorTitle("");
      setEditorContent("");
    }
  }, [store.selectedNoteId]);

  const handleSaveEditor = () => {
    if (store.selectedNoteId) {
      store.updateNote(store.selectedNoteId, {
        title: editorTitle,
        content: editorContent,
      });
    } else if (editorTitle.trim()) {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: editorTitle.trim(),
        content: editorContent.trim(),
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.addNote(newNote);
      store.setSelectedNoteId(newNote.id);
    }
  };

  const handleAddNote = () => {
    store.setSelectedNoteId(null);
    setEditorTitle("");
    setEditorContent("");
  };

  // Helper renderers for lists
  const renderNoteCard = (note: Note, isFullWidth = false) => {
    const isSelected = store.selectedNoteId === note.id;
    return (
      <Pressable
        key={note.id}
        onPress={() => {
          if (filter === "all") {
            store.setSelectedNoteId(note.id);
          } else {
            router.push(`/nota/${note.id}`);
          }
        }}
        style={[
          styles.listItem,
          { backgroundColor: isSelected ? colors.surface : colors.surfaceTranslucent },
          isSelected && Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.05,
              shadowRadius: 32,
            },
            android: { elevation: 2 },
          })
        ]}
      >
        <View style={styles.listItemContent}>
          <Text style={[styles.subtitleText, { color: colors.textPrimary }]} numberOfLines={1}>
            {note.title || "Sin título"}
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]} numberOfLines={1}>
            {note.content || "Sin contenido"}
          </Text>
        </View>

        <View style={styles.noteCardRight}>
          {isFullWidth && (
            <>
              <View style={[styles.datePill, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.dateText, { color: colors.textPrimary }]}>Apr 1, 2025</Text>
              </View>
              <View style={[styles.datePill, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.dateText, { color: colors.textPrimary }]}>9:41 AM</Text>
              </View>
            </>
          )}
          <Pressable onPress={() => store.toggleNoteFavorite(note.id)} hitSlop={8}>
            <Ionicons
              name={note.isFavorite ? "star" : "star-outline"}
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const renderTodoRow = (checklistId: string, item: any) => (
    <Pressable
      key={item.id}
      style={[styles.listItem, { backgroundColor: colors.surfaceTranslucent }]}
      onPress={() => store.toggleChecklistItem(checklistId, item.id)}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: colors.textPrimary },
          item.isCompleted && { backgroundColor: colors.textPrimary }
        ]}
      >
        {item.isCompleted && <Ionicons name="checkmark" size={16} color={colors.surface} />}
      </View>
      <Text style={[styles.subtitleText, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
        {item.task}
      </Text>
    </Pressable>
  );

  const renderIdeaRow = (idea: IdeaNote) => (
    <Pressable
      key={idea.id}
      style={[styles.listItem, { backgroundColor: colors.surfaceTranslucent }]}
      onPress={() => router.push(`/idea/${idea.id}`)}
    >
      <Ionicons name="caret-forward" size={14} color={colors.textPrimary} />
      <View style={[styles.listItemContent, { marginLeft: spacing.sm }]}>
        <Text style={[styles.subtitleText, { color: colors.textPrimary }]} numberOfLines={1}>
          {idea.title || "Sin título"}
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]} numberOfLines={1}>
          {idea.description || "Description"}
        </Text>
      </View>
      <Pressable onPress={() => store.toggleIdeaFavorite(idea.id)} hitSlop={8}>
        <Ionicons
          name={idea.isFavorite ? "star" : "star-outline"}
          size={20}
          color={colors.textPrimary}
        />
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* ─── Top bar (.bar) ─── */}
      <View style={styles.topBarContainer}>
        <View style={[styles.topBar, { backgroundColor: colors.surfaceTranslucent }]}>
          <Pressable style={styles.topBarIcon}>
            <Ionicons name="search-outline" size={20} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.filterRow}>
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={[
                    styles.filterChip,
                    isActive && {
                      backgroundColor: colors.accentLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: isActive ? colors.accent : colors.textPrimary },
                      isActive && { fontWeight: "600" }
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.topBarIcon}>
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* ─── Body ─── */}
      <View style={styles.body}>
        {filter === "all" ? (
          // ── Dashboard (All) Layout ──
          <>
            <View style={[styles.listContainer, styles.leftPanel, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={styles.panelHeader}>
                <Text style={[styles.titleText, { color: colors.textSecondary }]}>Note list</Text>
              </View>
              <Pressable onPress={handleAddNote} style={styles.addButton}>
                <Ionicons name="add" size={24} color={colors.textPrimary} />
              </Pressable>
              <ScrollView showsVerticalScrollIndicator={false}>
                {store.notes.map((n) => renderNoteCard(n, false))}
              </ScrollView>
            </View>

            <View style={[styles.centerPanel]}>
              <TextInput
                style={[styles.editorTitle, { color: colors.textPrimary }]}
                placeholder="Add title ..."
                placeholderTextColor={colors.textTertiary}
                value={editorTitle}
                onChangeText={setEditorTitle}
                onBlur={handleSaveEditor}
                underlineColorAndroid="transparent"
                selectionColor={colors.accent}
              />
              <TextInput
                style={[styles.editorContent, { color: colors.textPrimary }]}
                placeholder="Start writing..."
                placeholderTextColor={colors.textTertiary}
                value={editorContent}
                onChangeText={setEditorContent}
                onBlur={handleSaveEditor}
                multiline
                textAlignVertical="top"
                underlineColorAndroid="transparent"
                selectionColor={colors.accent}
              />
            </View>

            <View style={styles.rightColumn}>
              <View style={[styles.listContainer, styles.rightPanel, { backgroundColor: colors.surfaceSecondary }]}>
                <View style={styles.panelHeader}>
                  <Text style={[styles.titleTextCentered, { color: colors.textSecondary }]}>To Do</Text>
                  <Pressable
                    onPress={() => {
                      const newChecklist = {
                        id: crypto.randomUUID(),
                        title: "",
                        isFavorite: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        items: [],
                      };
                      store.addChecklist(newChecklist);
                      router.push(`/checklist/${newChecklist.id}`);
                    }}
                    style={{ marginBottom: 20 }}
                  >
                    <Ionicons name="add" size={24} color={colors.textPrimary} />
                  </Pressable>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {store.checklists.map((checklist) => (
                    <View key={checklist.id}>
                      <Pressable
                        onPress={() => router.push(`/checklist/${checklist.id}`)}
                        style={{ marginBottom: spacing.sm }}
                      >
                        <Text style={[styles.subtitleText, { color: colors.accent }]}>
                          {checklist.title || "Checklist sin título"}
                        </Text>
                      </Pressable>
                      {checklist.items.map((item) => renderTodoRow(checklist.id, item))}
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={[styles.listContainer, styles.rightPanel, { backgroundColor: colors.surfaceSecondary }]}>
                <View style={styles.panelHeader}>
                  <Text style={[styles.titleTextCentered, { color: colors.textSecondary }]}>Ideas</Text>
                  <Pressable
                    onPress={() => {
                      const newIdea = {
                        id: crypto.randomUUID(),
                        title: "",
                        description: "",
                        tags: [],
                        color: "#6366F1",
                        isFavorite: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      };
                      store.addIdea(newIdea);
                      router.push(`/idea/${newIdea.id}`);
                    }}
                    style={{ marginBottom: 20 }}
                  >
                    <Ionicons name="add" size={24} color={colors.textPrimary} />
                  </Pressable>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {store.ideas.map((idea) => renderIdeaRow(idea))}
                </ScrollView>
              </View>
            </View>
          </>
        ) : filter === "notes" ? (
          // ── Notes Full Layout ──
          <View style={[styles.listContainer, styles.fullWidthPanel, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.panelHeader}>
              <Text style={[styles.titleText, { color: colors.textSecondary }]}>Note list</Text>
            </View>
            <Pressable onPress={handleAddNote} style={styles.addButton}>
              <Ionicons name="add" size={24} color={colors.textPrimary} />
            </Pressable>
            <ScrollView showsVerticalScrollIndicator={false}>
              {store.notes.map((n) => renderNoteCard(n, true))}
            </ScrollView>
          </View>
        ) : filter === "todo" ? (
          // ── To Do Full Layout ──
          <View style={[styles.listContainer, styles.fullWidthPanel, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.panelHeader}>
              <Text style={[styles.titleText, { color: colors.textSecondary }]}>To Do</Text>
            </View>
            <Pressable
              onPress={() => {
                const newChecklist = {
                  id: crypto.randomUUID(),
                  title: "",
                  isFavorite: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  items: [],
                };
                store.addChecklist(newChecklist);
                router.push(`/checklist/${newChecklist.id}`);
              }}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color={colors.textPrimary} />
            </Pressable>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.centeredListContent}>
              {store.checklists.map((checklist) => (
                <View key={checklist.id}>
                  <Pressable
                    onPress={() => router.push(`/checklist/${checklist.id}`)}
                    style={{ marginBottom: spacing.sm }}
                  >
                    <Text style={[styles.subtitleText, { color: colors.accent }]}>
                      {checklist.title || "Checklist sin título"}
                    </Text>
                  </Pressable>
                  {checklist.items.map((item) => renderTodoRow(checklist.id, item))}
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          // ── Ideas Full Layout ──
          <View style={[styles.listContainer, styles.fullWidthPanel, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.panelHeader}>
              <Text style={[styles.titleText, { color: colors.textSecondary }]}>Ideas</Text>
            </View>
            <Pressable
              onPress={() => {
                const newIdea = {
                  id: crypto.randomUUID(),
                  title: "",
                  description: "",
                  tags: [],
                  color: "#6366F1",
                  isFavorite: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                store.addIdea(newIdea);
                router.push(`/idea/${newIdea.id}`);
              }}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color={colors.textPrimary} />
            </Pressable>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.centeredListContent}>
              {store.ideas.map((idea) => renderIdeaRow(idea))}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Static styles (Mapped to Figma CSS) ─────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  /* Top bar (.bar) */
  topBarContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: radius.lg, // 24px
    gap: spacing.xl,
    // Backdrop blur doesn't work perfectly in RN natively without specific views like BlurView,
    // but the background color handles the look mostly.
  },
  topBarIcon: {
    padding: spacing.xs,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  filterLabel: {
    ...typography.subtitle,
  },

  /* Body */
  body: {
    flex: 1,
    flexDirection: "row",
    padding: 24,
    paddingTop: 0,
    gap: 24,
  },

  /* .list-container */
  listContainer: {
    borderRadius: radius.xl, // 28px
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 32,
      },
      android: { elevation: 2 },
    })
  },
  fullWidthPanel: {
    flex: 1,
  },

  /* Left panel (Dashboard) */
  leftPanel: {
    width: 320,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    ...typography.title, // 22px
  },
  titleTextCentered: {
    ...typography.title, // 22px
    textAlign: "center",
    marginBottom: 20,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 20,
  },

  /* .list-item */
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.lg, // 24px
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listItemContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  subtitleText: {
    ...typography.subtitle, // 16px, 500
    marginBottom: 2,
  },
  bodyText: {
    ...typography.body, // 14px, 400
  },

  noteCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginRight: 4,
  },
  dateText: {
    ...typography.body,
    fontSize: 12,
  },

  /* Center panel (Editor) */
  centerPanel: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  editorTitle: {
    ...typography.title,
    fontSize: 48,
    marginBottom: 20,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
  editorContent: {
    flex: 1,
    ...typography.body,
    fontSize: 18,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
  /* Right column (Dashboard) */
  rightColumn: {
    width: 320,
    gap: 24,
  },
  rightPanel: {
    flex: 1,
  },

  /* Shared list contents */
  centeredListContent: {
    paddingHorizontal: spacing.md,
  },

  /* Checkbox style */
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: radius.sm, // 6px
    alignItems: "center",
    justifyContent: "center",
  },
});
