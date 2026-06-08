import React, { useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useNotesStore } from "../store/noteStore";
import { useThemeColors } from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { spacing, radius, typography } from "../constants/theme";
import { TrashButton } from "./TrashButton";

export function SearchBar() {
  const colors = useThemeColors();
  const { toolbarContainer, isMobile } = useResponsive();
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery);
  const showFavoritesOnly = useNotesStore((s) => s.showFavoritesOnly);
  const setShowFavoritesOnly = useNotesStore((s) => s.setShowFavoritesOnly);
  const selectionMode = useNotesStore((s) => s.selectionMode);
  const enterSelectionMode = useNotesStore((s) => s.enterSelectionMode);
  const exitSelectionMode = useNotesStore((s) => s.exitSelectionMode);
  const [filterHovered, setFilterHovered] = useState(false);

  const filterActive = showFavoritesOnly || filterHovered;
  const actionSize = isMobile ? 40 : 44;

  return (
    <View style={toolbarContainer}>
      <View style={styles.wrapper}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.surfaceTranslucent },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Buscar..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="never"
            underlineColorAndroid="transparent"
            selectionColor={colors.accent}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        <TrashButton
          onPress={() => (selectionMode ? exitSelectionMode() : enterSelectionMode())}
          active={selectionMode}
          style={{ width: actionSize, height: actionSize }}
        />

        <Pressable
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          onHoverIn={() => setFilterHovered(true)}
          onHoverOut={() => setFilterHovered(false)}
          accessibilityRole="button"
          accessibilityLabel="Filtrar favoritos"
          style={({ pressed }) => [
            styles.filterButton,
            {
              width: actionSize,
              height: actionSize,
              backgroundColor:
                showFavoritesOnly || filterHovered || pressed
                  ? colors.accentLight
                  : colors.surfaceTranslucent,
            },
          ]}
        >
          <Ionicons
            name={filterActive ? "star" : "star-outline"}
            size={20}
            color={filterActive ? colors.accent : colors.textPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.full,
    minWidth: 0,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as never,
    minWidth: 0,
  },
  filterButton: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
