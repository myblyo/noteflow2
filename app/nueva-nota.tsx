import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { z } from "zod";

import { useThemeColors } from "../hooks/useTheme";
import { noteSchema, checklistSchema, ideaSchema } from "../types/schemas";
import { useNotesStore } from "../store/noteStore";
import type { Note, ChecklistNote, IdeaNote } from "../types";

type NoteFormType = "note" | "checklist" | "idea";

const TYPES: { key: NoteFormType; label: string }[] = [
  { key: "note", label: "Note" },
  { key: "checklist", label: "Checklist" },
  { key: "idea", label: "Idea" },
];

export default function NuevaNotaScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const store = useNotesStore();

  const [type, setType] = useState<NoteFormType>("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    description?: string;
  }>({});

  const handleTypeChange = (newType: NoteFormType) => {
    setType(newType);
    setContent("");
    setDescription("");
    setErrors({});
  };

  const handleSave = () => {
    try {
      if (type === "note") {
        const data = noteSchema.parse({ title, content });
        const newNote: Note = {
          id: crypto.randomUUID(),
          title: data.title,
          content: data.content,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.addNote(newNote);
      }

      if (type === "idea") {
        const data = ideaSchema.parse({ title, description });
        const newIdea: IdeaNote = {
          id: crypto.randomUUID(),
          title: data.title,
          description: data.description ?? "",
          color: "#6366F1",
          tags: [],
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.addIdea(newIdea);
      }

      if (type === "checklist") {
        const data = checklistSchema.parse({ title });
        const newChecklist: ChecklistNote = {
          id: crypto.randomUUID(),
          title: data.title,
          items: [],
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.addChecklist(newChecklist);
      }

      setErrors({});
      router.back();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors as Partial<Record<string, string[]>>;
        setErrors({
          title: fieldErrors.title?.[0] ?? "",
          content: fieldErrors.content?.[0] ?? "",
          description: fieldErrors.description?.[0] ?? "",
        });
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
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
              <TextInput
                placeholder="Contenido"
                placeholderTextColor={colors.textTertiary}
                value={content}
                onChangeText={(v) => {
                  setContent(v);
                  setErrors((e) => ({ ...e, content: "" }));
                }}
                multiline
                style={{
                  color: colors.textPrimary,
                  minHeight: 120,
                  textAlignVertical: "top",
                  borderBottomWidth: 1,
                  borderColor: errors.content ? "red" : colors.divider,
                  marginBottom: 4,
                  paddingVertical: 8,
                  fontSize: 15,
                }}
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
            </>
          )}

          {/* Checklist — info */}
          {type === "checklist" && (
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8 }}>
              Los ítems se añaden después de crear la lista.
            </Text>
          )}

          {/* Guardar */}
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
    </SafeAreaView>
  );
}