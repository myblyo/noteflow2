import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeColors } from "../hooks/useTheme";
import { spacing, typography } from "../constants/theme";

export default function Notas() {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Text style={[styles.header, { color: colors.textPrimary }]}>
        NOTAS SCREEN
      </Text>
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
  },
});