import React, { useState, useEffect, useRef } from "react";
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

import { Alert } from "react-native";
import { useHaptics } from "../../hooks/useHaptics";
import { FavoriteStarButton } from "../../components/FavoriteStarButton";
import { formatDate } from "../../utils/formatDate";
import { useResponsive } from "../../hooks/useResponsive";
import { PageTransition } from "../../components/PageTransition";
import {
  NoteRichEditor,
  type NoteRichEditorRef,
} from "../../components/NoteRichEditor";
import { getNoteAttachments } from "../../lib/api";

export default function NotaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const { isMobile, isLargeScreen, isXL, isWide, width } = useResponsive();
  const store = useNotesStore();
  const router = useRouter();

  const chromePadding = isXL ? 56 : isLargeScreen ? 48 : isMobile ? 24 : 36;
  const editorPadding = isXL ? 40 : isLargeScreen ? 32 : isMobile ? 16 : 24;
  const editorMaxWidth = isXL ? 1280 : isWide ? 1120 : isLargeScreen ? 960 : isMobile ? width : 720;
  const edgeMargin = isMobile ? spacing.lg : isLargeScreen ? 24 : spacing.md;
  const verticalMargin = isLargeScreen ? spacing.xxl : spacing.lg;
  const editorMinHeight = isLargeScreen ? 480 : 320;

  const note = store.notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const editorRef = useRef<NoteRichEditorRef>(null);
  const loadedNoteIdRef = useRef<string | null>(null);

  const haptics = useHaptics();

  useEffect(() => {
    if (!id) return;
    getNoteAttachments(id)
      .then((rows) => setAttachmentUrls(rows.map((row) => row.url)))
      .catch(() => setAttachmentUrls([]));
  }, [id]);

  useEffect(() => {
    loadedNoteIdRef.current = null;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (loadedNoteIdRef.current === id) return;
    const current = store.notes.find((n) => n.id === id);
    if (!current) return;
    loadedNoteIdRef.current = id;
    setTitle(current.title);
    setContent(current.content);
  }, [id, store.notes]);

  const handleSave = async () => {
    if (!id) return;
    let nextContent = content;
    if (editorRef.current?.hasPendingUploads()) {
      nextContent = await editorRef.current.flushPendingUploads(id);
      setContent(nextContent);
    }
    store.updateNote(id, {
      title: title.trim(),
      content: nextContent,
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
            goBack(router, DETAIL_FALLBACKS.note);
          },
        },
      ]
    );
  };

  if (!note) {
    return (
      <PageTransition variant="stack">
      <ModalShell
        maxWidth={editorMaxWidth}
        style={[
          styles.root,
          { marginHorizontal: edgeMargin, marginVertical: verticalMargin },
        ]}
      >
        <View style={[styles.header, { paddingHorizontal: chromePadding }]}>
          <BackButton fallback={DETAIL_FALLBACKS.note} icon="close" />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nota no encontrada
          </Text>
        </View>
      </ModalShell>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="stack">
    <ModalShell
      maxWidth={editorMaxWidth}
      style={[
        styles.root,
        { marginHorizontal: edgeMargin, marginVertical: verticalMargin },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: chromePadding }]}>
        <BackButton fallback={DETAIL_FALLBACKS.note} onPressBefore={handleSave} />

        <View style={styles.headerActions}>
          <FavoriteStarButton
            isFavorite={note.isFavorite}
            onPress={() => store.toggleNoteFavorite(id!)}
            size={22}
            style={styles.headerBtn}
          />
          <Pressable onPress={() => handleDelete(id!, "note")} hitSlop={8} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        </View>
      </View>

      {/* Editor */}
      <ScrollView
        style={styles.editorScroll}
        contentContainerStyle={[
          styles.editorContainer,
          {
            paddingHorizontal: editorPadding,
            paddingBottom: spacing.xxl * 2,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        keyboardDismissMode="interactive"
      >
        <TextInput
          style={[
            styles.titleInput,
            { color: colors.textPrimary, fontSize: isLargeScreen ? 40 : 32 },
          ]}
          placeholder="Título..."
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          onBlur={handleSave}
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />
        <NoteRichEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          noteId={id}
          placeholder="Escribe aquí..."
          minHeight={editorMinHeight}
          fontSize={isLargeScreen ? 19 : 17}
          lineHeight={isLargeScreen ? 30 : 26}
          attachmentUrls={attachmentUrls}
          onBlur={handleSave}
          onAttachmentsChange={(noteId, urls) => {
            setAttachmentUrls(urls);
            store.setNoteAttachmentMeta(noteId, urls[0] ?? null, urls.length);
          }}
        />
      </ScrollView>

      {/* Footer meta */}
      <View
        style={[
          styles.footer,
          { borderTopColor: colors.divider, paddingHorizontal: chromePadding },
        ]}
      >
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Creada: {formatDate(note.createdAt)}
        </Text>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Editada: {formatDate(note.updatedAt)}
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
    paddingVertical: spacing.xl,
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
    paddingTop: spacing.xl,
    flexGrow: 1,
    width: "100%",
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
    width: "100%",
    ...typography.body,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
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
