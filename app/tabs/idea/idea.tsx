import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotesStore } from "../../../store/noteStore";
import { useThemeColors } from "../../../hooks/useTheme";
import { spacing, radius, typography } from "../../../constants/theme";

export default function IdeasScreen() {
  const ideas = useNotesStore((state) => state.ideas);
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Text style={[styles.header, { color: colors.textPrimary }]}>Ideas</Text>

      {ideas.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          No hay ideas todavía
        </Text>
      ) : (
        ideas.map((idea) => (
          <View
            key={idea.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderLeftColor: idea.color || colors.accent,
                borderLeftWidth: 4,
              },
            ]}
          >
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {idea.title}
            </Text>
            {idea.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {idea.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.tag,
                      { backgroundColor: colors.accentLight },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.accent }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  tagText: {
    ...typography.caption,
    fontWeight: "500",
  },
});