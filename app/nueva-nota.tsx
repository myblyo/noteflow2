import React, { useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { ModalShell } from "../components/ModalShell";
import { BackButton } from "../components/BackButton";
import { useRouter } from "expo-router";
import { DETAIL_FALLBACKS } from "../utils/routes";
import { z } from "zod";

import { useThemeColors } from "../hooks/useTheme";
import { scrollContentGutter, scrollViewProps, scrollViewWebStyle } from "../constants/sharedStyles";
import { noteSchema, checklistSchema, ideaSchema } from "../types/schemas";
import { useNotesStore } from "../store/noteStore";
import { DEFAULT_IDEA_COLOR } from "../constants/ideaColors";
import { IdeaColorPicker } from "../components/IdeaColorPicker";
import { PageTransition } from "../components/PageTransition";
import { NoteRichEditor, type NoteRichEditorRef } from "../components/NoteRichEditor";
import { setSlideForward } from "../utils/navigation";

type NoteFormType = "note" | "checklist" | "idea";

const TYPES: { key: NoteFormType; label: string }[] = [
  { key: "note", label: "Note" },
  { key: "checklist", label: "Checklist" },
  { key: "idea", label: "Idea" },
];

function parseNoteType(value: string | string[] | undefined): NoteFormType {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "idea" || raw === "checklist" || raw === "note") return raw;
  return "note";
}

export default function NuevaNotaScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const store = useNotesStore();
  const { type: typeParam } = useLocalSearchParams<{ type?: string }>();

  const [type, setType] = useState<NoteFormType>(() => parseNoteType(typeParam));
  const backFallback =
    type === "idea"
      ? DETAIL_FALLBACKS.idea
      : type === "checklist"
        ? DETAIL_FALLBACKS.checklist
        : DETAIL_FALLBACKS.nuevaNota;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [ideaColor, setIdeaColor] = useState(DEFAULT_IDEA_COLOR);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    description?: string;
    general?: string;
  }>({});
  const editorRef = useRef<NoteRichEditorRef>(null);

  const handleTypeChange = (newType: NoteFormType) => {
    setType(newType);
    setContent("");
    setDescription("");
    setIdeaColor(DEFAULT_IDEA_COLOR);
    setErrors({});
  };

  const handleSave = async () => {
    try {
      if (type === "note") {
        const data = noteSchema.parse({ title, content });
        let finalContent = content;
        const newNote = await store.addNote({
          title: data.title,
          content: finalContent,
        });
        if (editorRef.current?.hasPendingUploads()) {
          finalContent = await editorRef.current.flushPendingUploads(newNote.id);
          await store.updateNote(newNote.id, { title: data.title, content: finalContent });
        }
        setErrors({});
        setSlideForward();
        router.replace({ pathname: "/nota/[id]", params: { id: newNote.id } });
        return;
      }

      if (type === "idea") {
        const data = ideaSchema.parse({ title, description });
        const newIdea = await store.addIdea({
          title: data.title,
          description: data.description ?? "",
          color: ideaColor,
        });
        setErrors({});
        setSlideForward();
        router.replace({ pathname: "/idea/[id]", params: { id: newIdea.id } });
        return;
      }

      if (type === "checklist") {
        const data = checklistSchema.parse({ title });
        const newChecklist = await store.addChecklist({ title: data.title });
        setErrors({});
        setSlideForward();
        router.replace({
          pathname: "/checklist/[id]",
          params: { id: newChecklist.id },
        });
        return;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors as Partial<Record<string, string[]>>;
        setErrors({
          title: fieldErrors.title?.[0] ?? "",
          content: fieldErrors.content?.[0] ?? "",
          description: fieldErrors.description?.[0] ?? "",
        });
        return;
      }
      if (error instanceof Error) {
        setErrors({ title: "", content: "", description: "", general: error.message });
      }
    }
  };

  return (
    <PageTransition variant="fade">
    <ModalShell>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={[{ flex: 1 }, scrollViewWebStyle]}
          contentContainerStyle={[{ padding: 20, paddingBottom: 40 }, scrollContentGutter]}
          {...scrollViewProps}
        >
          <BackButton fallback={backFallback} style={{ marginBottom: 16 }} />
          <Text style={{ color: colors.textPrimary, fontSize: 20, marginBottom: 20 }}>
            Nueva nota
          </Text>

          {/* Selector de tipo */}
          <View style={{ flexDirection: "row", marginBottom: 24 }}>
            {TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => handleTypeChange(t.key)}
                style={{
                  marginRight: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor:
                    type === t.key ? colors.accent : colors.surfaceTranslucent,
                }}
              >
                <Text style={{
                  color: type === t.key ? "#fff" : colors.textPrimary,
                  fontWeight: type === t.key ? "600" : "400",
                }}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Título */}
          <TextInput
            placeholder="Título"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              setErrors((e) => ({ ...e, title: "" }));
            }}
            style={{
              color: colors.textPrimary,
              borderBottomWidth: 1,
              borderColor: errors.title ? "red" : colors.divider,
              marginBottom: 4,
              paddingVertical: 8,
              fontSize: 16,
            }}
          />
          {errors.title ? (
            <Text style={{ color: "red", fontSize: 12, marginBottom: 16 }}>
              {errors.title}
            </Text>
          ) : (
            <View style={{ marginBottom: 16 }} />
          )}

          {/* Contenido — Note */}
          {type === "note" && (
            <>
              <NoteRichEditor
                ref={editorRef}
                value={content}
                onChange={(value) => {
                  setContent(value);
                  setErrors((e) => ({ ...e, content: "" }));
                }}
                placeholder="Contenido"
                minHeight={120}
              />
              {errors.content ? (
                <Text style={{ color: "red", fontSize: 12 }}>{errors.content}</Text>
              ) : null}
            </>
          )}

          {/* Descripción — Idea */}
          {type === "idea" && (
            <>
              <TextInput
                placeholder="Descripción (opcional)"
                placeholderTextColor={colors.textTertiary}
                value={description}
                onChangeText={(v) => {
                  setDescription(v);
                  setErrors((e) => ({ ...e, description: "" }));
                }}
                multiline
                style={{
                  color: colors.textPrimary,
                  minHeight: 120,
                  textAlignVertical: "top",
                  borderBottomWidth: 1,
                  borderColor: errors.description ? "red" : colors.divider,
                  marginBottom: 4,
                  paddingVertical: 8,
                  fontSize: 15,
                }}
              />
              {errors.description ? (
                <Text style={{ color: "red", fontSize: 12 }}>{errors.description}</Text>
              ) : null}
              <IdeaColorPicker
                selectedColor={ideaColor}
                onSelectColor={setIdeaColor}
              />
            </>
          )}

          {/* Checklist — info */}
          {type === "checklist" && (
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8 }}>
              Los ítems se añaden después de crear la lista.
            </Text>
          )}

          {/* Guardar */}
          {errors.general ? (
            <Text style={{ color: "red", fontSize: 13, marginTop: 16 }}>
              {errors.general}
            </Text>
          ) : null}
          <Pressable
            onPress={handleSave}
            style={{
              marginTop: 32,
              padding: 15,
              backgroundColor: colors.accent,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
              Guardar
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ModalShell>
    </PageTransition>
  );
}