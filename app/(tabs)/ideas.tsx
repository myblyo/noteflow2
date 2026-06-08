import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { useRouter } from "expo-router";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { useItemSelection } from "../../hooks/useItemSelection";
import { spacing } from "../../constants/theme";
import { sharedStyles } from "../../constants/sharedStyles";
import type { IdeaNote } from "../../types";
import { FlashList } from "@shopify/flash-list";
import { filterIdeas } from "../../utils/filterItems";
import { ideaDetailRoute, nuevaNotaRoute } from "../../utils/routes";
import { navigateForward } from "../../utils/navigation";
import { PageTransition } from "../../components/PageTransition";
import { AddButton } from "../../components/AddButton";
import { FavoriteStarButton } from "../../components/FavoriteStarButton";
import { SelectionCheckbox } from "../../components/SelectionCheckbox";
import { IdeaListLeading } from "../../components/IdeaListLeading";

export default function IdeasScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const showFavoritesOnly = useNotesStore((s) => s.showFavoritesOnly);
  const { selectionMode, isSelected, handlePress } = useItemSelection("idea");

  const filteredIdeas = useMemo(
    () => filterIdeas(store.ideas, searchQuery, showFavoritesOnly),
    [store.ideas, searchQuery, showFavoritesOnly],
  );

  const renderIdeaRow = ({ item }: { item: IdeaNote }) => {
    const selected = isSelected(item.id);

    return (
      <Pressable
        onPress={() =>
          handlePress(item.id, () => navigateForward(router, ideaDetailRoute(item.id)))
        }
        style={[
          sharedStyles.listItem,
          {
            backgroundColor: selected ? colors.surface : colors.surfaceTranslucent,
            borderWidth: selected ? 2 : 0,
            borderColor: selected ? colors.accent : "transparent",
          },
        ]}
      >
        {selectionMode ? (
          <SelectionCheckbox selected={selected} />
        ) : (
          <IdeaListLeading color={item.color} />
        )}

        <View style={[sharedStyles.listItemContent, { marginLeft: spacing.sm }]}>
          <Text
            style={[sharedStyles.subtitleText, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {item.title || "Sin título"}
          </Text>
          <Text
            style={[sharedStyles.bodyText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.description || "Sin contenido"}
          </Text>
        </View>

        {!selectionMode && (
          <FavoriteStarButton
            isFavorite={item.isFavorite}
            onPress={() => store.toggleIdeaFavorite(item.id)}
          />
        )}
      </Pressable>
    );
  };

  return (
    <PageTransition variant="tab" routeKey="ideas">
    <ResponsiveShell>
      <View
        style={[
          sharedStyles.listContainer,
          sharedStyles.fullWidthPanel,
          { backgroundColor: colors.surfaceSecondary, flex: 1 },
        ]}
      >
        <View style={sharedStyles.panelHeader}>
          <Text style={[sharedStyles.titleText, { color: colors.textSecondary }]}>
            Ideas
          </Text>
        </View>
        {!selectionMode && (
          <AddButton onPress={() => navigateForward(router, nuevaNotaRoute("idea"))} />
        )}
        <View style={{ flex: 1, minHeight: 0 }}>
          {filteredIdeas.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
              <Text style={[sharedStyles.bodyText, { color: colors.textSecondary }]}>
                {showFavoritesOnly
                  ? "No hay ideas favoritas"
                  : searchQuery.trim()
                    ? "No hay ideas que coincidan con tu búsqueda"
                    : "No hay ideas todavía"}
              </Text>
            </View>
          ) : (
            <FlashList
              data={filteredIdeas}
              renderItem={renderIdeaRow}
              keyExtractor={(item) => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={sharedStyles.centeredListContent}
            />
          )}
        </View>
      </View>
    </ResponsiveShell>
    </PageTransition>
  );
}

