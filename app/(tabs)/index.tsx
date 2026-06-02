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

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { useSeedData } from "../../hooks/useSeedData";
import { spacing, radius, typography } from "../../constants/theme";
import { sharedStyles } from "../../constants/sharedStyles";
import type { NoteType, Note, IdeaNote } from "../../types";



// ─── Dashboard screen (All) ─────────────────────────────────────

export default function DashboardScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  // Seed data on first mount
  useSeedData();
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");

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

  // ─── Helper renderers ───────────────────────────────────────

  const renderNoteCard = (note: Note, isFullWidth = false) => {
    const isSelected = store.selectedNoteId === note.id;
    return (
      <Pressable
        key={note.id}
        onPress={() => {
          store.setSelectedNoteId(note.id);
        }}
        style={[
          sharedStyles.listItem,
          { backgroundColor: isSelected ? colors.surface : colors.surfaceTranslucent },
          isSelected && Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.05,
              shadowRadius: 32,
            },
            android: { elevation: 2 },
          }),
        ]}
      >
        <View style={sharedStyles.listItemContent}>
          <Text style={[sharedStyles.subtitleText, { color: colors.textPrimary }]} numberOfLines={1}>
            {note.title || "Sin título"}
          </Text>
          <Text style={[sharedStyles.bodyText, { color: colors.textSecondary }]} numberOfLines={1}>
            {note.content || "Sin contenido"}
          </Text>
        </View>

        <View style={sharedStyles.noteCardRight}>
          {isFullWidth && (
            <>
              <View style={[sharedStyles.datePill, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[sharedStyles.dateText, { color: colors.textPrimary }]}>Apr 1, 2025</Text>
              </View>
              <View style={[sharedStyles.datePill, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[sharedStyles.dateText, { color: colors.textPrimary }]}>9:41 AM</Text>
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
      style={[sharedStyles.listItem, { backgroundColor: colors.surfaceTranslucent }]}
      onPress={() => store.toggleChecklistItem(checklistId, item.id)}
    >
      <View
        style={[
          sharedStyles.checkbox,
          { borderColor: colors.textPrimary },
          item.isCompleted && { backgroundColor: colors.textPrimary },
        ]}
      >
        {item.isCompleted && <Ionicons name="checkmark" size={16} color={colors.surface} />}
      </View>
      <Text style={[sharedStyles.subtitleText, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
        {item.task}
      </Text>
    </Pressable>
  );

  const renderIdeaRow = (idea: IdeaNote) => (
    <Pressable
      key={idea.id}
      style={[sharedStyles.listItem, { backgroundColor: colors.surfaceTranslucent }]}
      onPress={() => router.push(`/idea/${idea.id}`)}
    >
      <Ionicons name="caret-forward" size={14} color={colors.textPrimary} />
      <View style={[sharedStyles.listItemContent, { marginLeft: spacing.sm }]}>
        <Text style={[sharedStyles.subtitleText, { color: colors.textPrimary }]} numberOfLines={1}>
          {idea.title || "Sin título"}
        </Text>
        <Text style={[sharedStyles.bodyText, { color: colors.textSecondary }]} numberOfLines={1}>
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

  // ─── Render ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={[sharedStyles.root, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* ─── Body ─── */}
      <View style={[sharedStyles.body, { paddingTop: 24 }]}>
        {/* ── Dashboard (All) Layout ── */}
        <View style={[sharedStyles.listContainer, styles.leftPanel, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={sharedStyles.panelHeader}>
            <Text style={[sharedStyles.titleText, { color: colors.textSecondary }]}>Note list</Text>
          </View>
          <Pressable onPress={handleAddNote} style={sharedStyles.addButton}>
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
          <View style={[sharedStyles.listContainer, styles.rightPanel, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={sharedStyles.panelHeader}>
              <Text style={[sharedStyles.titleTextCentered, { color: colors.textSecondary }]}>To Do</Text>
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
                    <Text style={[sharedStyles.subtitleText, { color: colors.accent }]}>
                      {checklist.title || "Checklist sin título"}
                    </Text>
                  </Pressable>
                  {checklist.items.map((item) => renderTodoRow(checklist.id, item))}
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={[sharedStyles.listContainer, styles.rightPanel, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={sharedStyles.panelHeader}>
              <Text style={[sharedStyles.titleTextCentered, { color: colors.textSecondary }]}>Ideas</Text>
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
      </View>
    </SafeAreaView>
  );
}

// ─── Styles specific to the Dashboard ──────────────────────────

const styles = StyleSheet.create({
  /* Left panel (Dashboard) */
  leftPanel: {
    width: 320,
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
});
