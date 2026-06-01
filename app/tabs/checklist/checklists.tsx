import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotesStore } from "../../../store/noteStore";
import { useThemeColors } from "../../../hooks/useTheme";
import { spacing, radius, typography } from "../../../constants/theme";

export default function ChecklistsScreen() {
  const checklists = useNotesStore((state) => state.checklists);
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Text style={[styles.header, { color: colors.textPrimary }]}>
        Checklists
      </Text>

      {checklists.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          No hay checklists todavía
        </Text>
      ) : (
        checklists.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {item.items.length} tareas
            </Text>
          </View>
        ))
      )}
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
    marginBottom: spacing.md,
  },
  empty: {
    ...typography.body,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  card: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
  },
});