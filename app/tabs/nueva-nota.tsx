import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing, radius, typography } from "../../constants/theme";

export default function NuevaNota() {
  const addNote = useNotesStore((state) => state.addNote);
  const colors = useThemeColors();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (!title.trim()) return;

    addNote({
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      isFavorite: false,
      createdAt: new Date(),
      updateAt: new Date(),
    });

    setTitle("");
    setContent("");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Text style={[styles.header, { color: colors.textPrimary }]}>
        Nueva Nota
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.textPrimary,
            borderColor: colors.border,
          },
        ]}
        placeholder="Título"
        placeholderTextColor={colors.textTertiary}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[
          styles.input,
          styles.contentInput,
          {
            backgroundColor: colors.surface,
            color: colors.textPrimary,
            borderColor: colors.border,
          },
        ]}
        placeholder="Contenido"
        placeholderTextColor={colors.textTertiary}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      <Pressable
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={handleSave}
      >
        <Text style={[styles.buttonText, { color: colors.textInverse }]}>
          Guardar
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    ...typography.h1,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  contentInput: {
    minHeight: 120,
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.button,
  },
});