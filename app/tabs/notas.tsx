import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotesStore } from "../../store/noteStore";
import type { Note } from "../../types";

export default function NotasScreen() {
  const notes = useNotesStore((state) => state.notes);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.header}>Notas</Text>

      {notes.length === 0 ? (
        <Text style={styles.empty}>No hay notas todavía</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <NoteCard note={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{note.title}</Text>
      {note.content ? (
        <Text style={styles.content} numberOfLines={3}>
          {note.content}
        </Text>
      ) : null}
      <Text style={styles.date}>
        {note.createdAt.toLocaleDateString()} ·{" "}
        {note.updateAt.toLocaleDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginTop: 8,
    marginBottom: 16,
  },
  empty: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 32,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
  },
  content: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
