import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";

const links = [
  { href: "/notas" as const, label: "Notas", icon: "document-text-outline" as const },
  { href: "/checklists" as const, label: "Checklists", icon: "checkbox-outline" as const },
  { href: "/ideas" as const, label: "Ideas", icon: "bulb-outline" as const },
  { href: "/fulllayout" as const, label: "Full Layout", icon: "grid-outline" as const },
] as const;

export default function Home() {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Text style={[styles.header, { color: colors.textPrimary }]}>
        Noteflow
      </Text>

      <View style={styles.grid}>
        {links.map((link) => (
          <Pressable
            key={link.href}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push(link.href)}
          >
            <Ionicons name={link.icon} size={28} color={colors.accent} />
            <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
              {link.label}
            </Text>
          </Pressable>
        ))}
      </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    width: "47%",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  cardLabel: {
    ...typography.bodyMedium,
  },
});