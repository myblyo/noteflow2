import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { spacing, radius, typography } from "../../constants/theme";
import { sharedStyles, scrollContentGutter, scrollViewProps, scrollViewWebStyle } from "../../constants/sharedStyles";
import type { Note, IdeaNote } from "../../types";
import { filterNotes, filterIdeas, filterChecklists } from "../../utils/filterItems";
import {
  ideaDetailRoute,
  checklistDetailRoute,
  nuevaNotaRoute,
} from "../../utils/routes";
import { navigateForward } from "../../utils/navigation";
import { IdeaListLeading } from "../../components/IdeaListLeading";
import { AddButton } from "../../components/AddButton";
import { ChecklistTitleRow } from "../../components/ChecklistTitleRow";
import { FavoriteStarButton } from "../../components/FavoriteStarButton";
import { SelectionCheckbox } from "../../components/SelectionCheckbox";
import { useItemSelection } from "../../hooks/useItemSelection";
import { useResponsive } from "../../hooks/useResponsive";
import { MobileDrawer } from "../../components/MobileDrawer";
import type { ChecklistNote } from "../../types";
import { PageTransition } from "../../components/PageTransition";
import { ProfileNavButton } from "../../components/ProfileNavButton";
import { NoteRichEditor, type NoteRichEditorRef } from "../../components/NoteRichEditor";
import { RemoteImage } from "../../components/RemoteImage";
import { documentIsEmpty, getPlainTextFromContent, parseNoteContent } from "../../utils/noteDocument";



// ─── Dashboard screen (All) ─────────────────────────────────────

export default function DashboardScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  const searchQuery = useNotesStore((s) => s.searchQuery);
  const showFavoritesOnly = useNotesStore((s) => s.showFavoritesOnly);
  const selectionMode = useNotesStore((s) => s.selectionMode);
  const noteSelection = useItemSelection("note");
  const ideaSelection = useItemSelection("idea");
  const checklistSelection = useItemSelection("checklist");
  const {
    isMobile,
    isTablet,
    isLargeScreen,
    dashboardBody,
    dashboardGap,
    sidePanelWidth,
    editorTitleSize,
    editorBodySize,
    centerPanelPadding,
    listContainerFlex,
  } = useResponsive();
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editorRef = useRef<NoteRichEditorRef>(null);
  const saveInFlightRef = useRef(false);
  const loadedEditorNoteIdRef = useRef<string | null>(null);

  const filteredNotes = useMemo(
    () => filterNotes(store.notes, searchQuery, showFavoritesOnly),
    [store.notes, searchQuery, showFavoritesOnly],
  );
  const filteredIdeas = useMemo(
    () => filterIdeas(store.ideas, searchQuery, showFavoritesOnly),
    [store.ideas, searchQuery, showFavoritesOnly],
  );
  const filteredChecklists = useMemo(
    () => filterChecklists(store.checklists, searchQuery, showFavoritesOnly),
    [store.checklists, searchQuery, showFavoritesOnly],
  );

  const emptyLabel = (type: "notas" | "ideas" | "tareas") => {
    if (showFavoritesOnly) return "Sin favoritos";
    if (searchQuery.trim()) return "Sin coincidencias";
    if (type === "notas") return "No hay notas";
    if (type === "ideas") return "No hay ideas";
    return "No hay tareas";
  };

  useEffect(() => {
    const noteId = store.selectedNoteId;
    if (noteId === loadedEditorNoteIdRef.current) {
      return;
    }
    loadedEditorNoteIdRef.current = noteId;

    if (!noteId) {
      setEditorTitle("");
      setEditorContent("");
      return;
    }

    const note = store.notes.find((n) => n.id === noteId);
    if (note) {
      setEditorTitle(note.title);
      setEditorContent(note.content);
    }
  }, [store.selectedNoteId, store.notes]);

  useEffect(() => {
    if (isMobile && store.selectedNoteId) {
      setDrawerOpen(false);
    }
  }, [store.selectedNoteId, isMobile]);

  const handleSaveEditor = async () => {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;

    try {
      const title = editorTitle.trim() || "Sin título";
      let content = editorContent;

      if (store.selectedNoteId) {
        if (editorRef.current?.hasPendingUploads()) {
          content = await editorRef.current.flushPendingUploads(store.selectedNoteId);
          setEditorContent(content);
        }
        await store.updateNote(store.selectedNoteId, { title, content });
        return;
      }

      const hasContent =
        editorTitle.trim() ||
        !documentIsEmpty(parseNoteContent(editorContent)) ||
        editorRef.current?.hasPendingUploads();

      if (hasContent) {
        const newNote = await store.addNote({ title, content });
        if (editorRef.current?.hasPendingUploads()) {
          content = await editorRef.current.flushPendingUploads(newNote.id);
          setEditorContent(content);
          await store.updateNote(newNote.id, { title, content });
        }
        loadedEditorNoteIdRef.current = newNote.id;
        store.setSelectedNoteId(newNote.id);
      }
    } finally {
      saveInFlightRef.current = false;
    }
  };

  const selectedNote = store.notes.find((n) => n.id === store.selectedNoteId);

  const handleAddNote = () => {
    navigateForward(router, nuevaNotaRoute());
  };

  // ─── Helper renderers ───────────────────────────────────────

  const renderNoteCard = (note: Note) => {
    const deleteSelected = noteSelection.isSelected(note.id);
    const editorSelected = store.selectedNoteId === note.id;
    const highlighted = deleteSelected || editorSelected;

    return (
      <Pressable
        key={note.id}
        onPress={() =>
          noteSelection.handlePress(note.id, () => store.setSelectedNoteId(note.id))
        }
        style={[
          sharedStyles.listItem,
          {
            backgroundColor: highlighted ? colors.surface : colors.surfaceTranslucent,
            borderWidth: deleteSelected ? 2 : 0,
            borderColor: deleteSelected ? colors.accent : "transparent",
          },
          highlighted && Platform.select({
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
        {selectionMode && <SelectionCheckbox selected={deleteSelected} />}
        <View style={sharedStyles.listItemContent}>
          <Text style={[sharedStyles.subtitleText, { color: colors.textPrimary }]} numberOfLines={1}>
            {note.title || "Sin título"}
          </Text>
          <Text style={[sharedStyles.bodyText, { color: colors.textSecondary }]} numberOfLines={1}>
            {getPlainTextFromContent(note.content) || "Sin contenido"}
          </Text>
          {(note.attachmentCount ?? 0) > 0 && note.attachmentPreviewUrl ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.xs, gap: spacing.xs }}>
              <RemoteImage
                uri={note.attachmentPreviewUrl}
                style={{ width: 36, height: 36, borderRadius: 6 }}
              />
              {(note.attachmentCount ?? 0) > 1 ? (
                <Text style={[sharedStyles.bodyText, { color: colors.textTertiary, fontSize: 12 }]}>
                  +{(note.attachmentCount ?? 0) - 1}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {!selectionMode && (
          <FavoriteStarButton
            isFavorite={note.isFavorite}
            onPress={() => store.toggleNoteFavorite(note.id)}
          />
        )}
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

  const renderIdeaRow = (idea: IdeaNote) => {
    const selected = ideaSelection.isSelected(idea.id);

    return (
      <Pressable
        key={idea.id}
        style={[
          sharedStyles.listItem,
          {
            backgroundColor: selected ? colors.surface : colors.surfaceTranslucent,
            borderWidth: selected ? 2 : 0,
            borderColor: selected ? colors.accent : "transparent",
          },
        ]}
        onPress={() =>
          ideaSelection.handlePress(idea.id, () => {
            navigateForward(router, ideaDetailRoute(idea.id));
            if (isMobile) setDrawerOpen(false);
          })
        }
      >
        {selectionMode ? (
          <SelectionCheckbox selected={selected} />
        ) : (
          <IdeaListLeading color={idea.color} />
        )}
        <View style={[sharedStyles.listItemContent, { marginLeft: spacing.sm }]}>
          <Text style={[sharedStyles.subtitleText, { color: colors.textPrimary }]} numberOfLines={1}>
            {idea.title || "Sin título"}
          </Text>
          <Text style={[sharedStyles.bodyText, { color: colors.textSecondary }]} numberOfLines={1}>
            {idea.description || "Description"}
          </Text>
        </View>
        {!selectionMode && (
          <FavoriteStarButton
            isFavorite={idea.isFavorite}
            onPress={() => store.toggleIdeaFavorite(idea.id)}
          />
        )}
      </Pressable>
    );
  };

  const renderChecklistBlock = (checklist: ChecklistNote) => {
    const selected = checklistSelection.isSelected(checklist.id);

    return (
      <Pressable
        key={checklist.id}
        onPress={() =>
          checklistSelection.handlePress(checklist.id, () => {
            navigateForward(router, checklistDetailRoute(checklist.id));
            if (isMobile) setDrawerOpen(false);
          })
        }
        style={[
          { marginBottom: spacing.md },
          selected && {
            borderWidth: 2,
            borderColor: colors.accent,
            borderRadius: 12,
            padding: spacing.sm,
          },
        ]}
      >
        {selectionMode ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.sm }}>
            <SelectionCheckbox selected={selected} />
            <Text
              style={[sharedStyles.subtitleText, { color: colors.accent, flex: 1, marginBottom: 0 }]}
              numberOfLines={1}
            >
              {checklist.title || "Checklist sin título"}
            </Text>
          </View>
        ) : (
          <ChecklistTitleRow checklist={checklist} />
        )}
        {!selectionMode &&
          checklist.items.map((item) => renderTodoRow(checklist.id, item))}
      </Pressable>
    );
  };

  const panelStyle = (width?: number) => [
    sharedStyles.listContainer,
    isMobile ? { width: "100%" as const } : listContainerFlex,
    width != null ? { width, maxWidth: width } : { width: "100%" as const },
    { backgroundColor: colors.surfaceSecondary },
  ];

  const notesPanel = (
    <View style={panelStyle(isMobile ? undefined : sidePanelWidth)}>
      <View style={sharedStyles.panelHeader}>
        <Text style={[sharedStyles.titleText, { color: colors.textSecondary }]}>Note list</Text>
      </View>
      {!selectionMode && <AddButton onPress={handleAddNote} />}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {filteredNotes.length === 0 ? (
          <Text style={[sharedStyles.bodyText, { color: colors.textSecondary, textAlign: "center", paddingVertical: spacing.md }]}>
            {emptyLabel("notas")}
          </Text>
        ) : (
          filteredNotes.map((n) => renderNoteCard(n))
        )}
      </ScrollView>
    </View>
  );

  const editorPanel = (
    <View
      style={[
        styles.centerPanel,
        {
          flex: 1,
          minHeight: 0,
          paddingHorizontal: centerPanelPadding,
        },
      ]}
    >
      <ScrollView
        style={[styles.editorScroll, scrollViewWebStyle]}
        contentContainerStyle={[styles.editorScrollContent, scrollContentGutter]}
        {...scrollViewProps}
      >
        <TextInput
          style={[styles.editorTitle, { color: colors.textPrimary, fontSize: editorTitleSize }]}
          placeholder="Add title ..."
          placeholderTextColor={colors.textTertiary}
          value={editorTitle}
          onChangeText={setEditorTitle}
          onBlur={handleSaveEditor}
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />
        <NoteRichEditor
          ref={editorRef}
          value={editorContent}
          onChange={setEditorContent}
          noteId={store.selectedNoteId}
          placeholder="Start writing..."
          fontSize={editorBodySize}
          onBlur={handleSaveEditor}
          onAttachmentsChange={(noteId, urls) => {
            store.setNoteAttachmentMeta(noteId, urls[0] ?? null, urls.length);
          }}
          onAutoPersist={(serialized) => {
            setEditorContent(serialized);
            if (store.selectedNoteId) {
              void store.updateNote(store.selectedNoteId, { content: serialized });
            }
          }}
        />
      </ScrollView>
    </View>
  );

  const secondaryPanelStyle = [
    sharedStyles.listContainer,
    listContainerFlex,
    styles.rightPanel,
    { backgroundColor: colors.surfaceSecondary, width: "100%" as const },
    !isMobile && { flex: 1 },
  ];

  const todoPanel = (
    <View style={secondaryPanelStyle}>
      <View style={sharedStyles.panelHeader}>
        <Text style={[sharedStyles.titleTextCentered, { color: colors.textSecondary }]}>To Do</Text>
        {!selectionMode && (
          <AddButton
            onPress={() => navigateForward(router, nuevaNotaRoute("checklist"))}
            style={{ marginBottom: 20 }}
          />
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {filteredChecklists.length === 0 ? (
          <Text style={[sharedStyles.bodyText, { color: colors.textSecondary, textAlign: "center", paddingVertical: spacing.md }]}>
            {emptyLabel("tareas")}
          </Text>
        ) : (
          filteredChecklists.map((checklist) => renderChecklistBlock(checklist))
        )}
      </ScrollView>
    </View>
  );

  const ideasPanel = (
    <View style={secondaryPanelStyle}>
      <View style={sharedStyles.panelHeader}>
        <Text style={[sharedStyles.titleTextCentered, { color: colors.textSecondary }]}>Ideas</Text>
        {!selectionMode && (
          <AddButton
            onPress={() => navigateForward(router, nuevaNotaRoute("idea"))}
            style={{ marginBottom: 20 }}
          />
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {filteredIdeas.length === 0 ? (
          <Text style={[sharedStyles.bodyText, { color: colors.textSecondary, textAlign: "center", paddingVertical: spacing.md }]}>
            {emptyLabel("ideas")}
          </Text>
        ) : (
          filteredIdeas.map((idea) => renderIdeaRow(idea))
        )}
      </ScrollView>
    </View>
  );

  const sidePanels = (
    <View
      style={[
        isMobile
          ? { width: "100%", gap: spacing.md }
          : isTablet
            ? { width: "100%", flexDirection: "row", gap: dashboardGap, minHeight: 320 }
            : { width: sidePanelWidth, gap: dashboardGap },
        isLargeScreen && [styles.rightColumn, { width: sidePanelWidth }],
      ]}
    >
      {todoPanel}
      {ideasPanel}
    </View>
  );

  const desktopLayout = (
    <View style={[dashboardBody, { flexDirection: "row" }]}>
      {notesPanel}
      {editorPanel}
      {sidePanels}
    </View>
  );

  const tabletLayout = (
    <View style={[dashboardBody, { flexDirection: "column" }]}>
      <View style={{ flexDirection: "row", gap: dashboardGap, flex: 1, minHeight: 360 }}>
        {notesPanel}
        {editorPanel}
      </View>
      {sidePanels}
    </View>
  );

  const drawerContent = (
    <>
      {notesPanel}
      <View style={{ height: spacing.lg }} />
      {sidePanels}
    </>
  );

  const mobileLayout = (
    <View style={[dashboardBody, { flexDirection: "column", flex: 1, minHeight: 0 }]}>
      <View style={styles.mobileHeader}>
        <Pressable
          onPress={() => setDrawerOpen(true)}
          hitSlop={12}
          style={styles.menuButton}
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
        >
          <Ionicons name="menu" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text
          style={[styles.mobileHeaderTitle, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {selectedNote?.title || "Nueva nota"}
        </Text>
        {!selectionMode ? (
          <View style={styles.mobileHeaderActions}>
            <ProfileNavButton size={36} />
            <Pressable onPress={handleAddNote} hitSlop={8}>
              <Ionicons name="add" size={26} color={colors.textPrimary} />
            </Pressable>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>
      {editorPanel}
      <MobileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerContent}
      </MobileDrawer>
    </View>
  );

  return (
    <PageTransition variant="tab" routeKey="index">
      <SafeAreaView style={[sharedStyles.root, { backgroundColor: colors.background }]} edges={["left", "right"]}>
        {isMobile ? mobileLayout : isTablet ? tabletLayout : desktopLayout}
      </SafeAreaView>
    </PageTransition>
  );
}

// ─── Styles specific to the Dashboard ──────────────────────────

const styles = StyleSheet.create({
  centerPanel: {
    flex: 1,
    minHeight: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    minWidth: 0,
  },
  editorScroll: {
    flex: 1,
  },
  editorScrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  editorTitle: {
    ...typography.title,
    marginBottom: spacing.lg,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as never,
  },
  editorContent: {
    flex: 1,
    ...typography.body,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as never,
  },
  rightColumn: {
    flexDirection: "column",
    flexShrink: 0,
  },
  rightPanel: {
    flex: 1,
    minHeight: 200,
  },
  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  menuButton: {
    padding: spacing.xs,
  },
  mobileHeaderTitle: {
    ...typography.subtitle,
    flex: 1,
    textAlign: "center",
  },
  mobileHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
