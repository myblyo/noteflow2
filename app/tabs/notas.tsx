import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing, radius, typography } from "../../constants/theme";
import type { Note } from "../../types";

export default function NotasScreen() {
  const notes = useNotesStore((state) => state.notes);
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Text style={[styles.header, { color: colors.textPrimary }]}>Notas</Text>

      {notes.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          No hay notas todavía
        </Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <NoteCard note={item} colors={colors} />}
        />
      )}
    </SafeAreaView>
  );
}

function NoteCard({
  note,
  colors,
}: {
  note: Note;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {note.title}
      </Text>
      {note.content ? (
        <Text
          style={[styles.content, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {note.content}
        </Text>
      ) : null}
      <Text style={[styles.date, { color: colors.textTertiary }]}>
        {new Date(note.createdAt).toLocaleDateString()} ·{" "}
        {new Date(note.updateAt).toLocaleDateString()}
      </Text>
    </View>
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
    marginBottom: spacing.md,
  },
  empty: {
    ...typography.body,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  list: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs + 2,
  },
  content: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.caption,
  },
});
