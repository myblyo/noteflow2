import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { useItemSelection } from "../../hooks/useItemSelection";
import { spacing } from "../../constants/theme";
import { sharedStyles } from "../../constants/sharedStyles";
import { FlashList } from "@shopify/flash-list";
import { ChecklistNote } from "../../types";
import { filterChecklists } from "../../utils/filterItems";
import { AddButton } from "../../components/AddButton";
import { ChecklistTitleRow } from "../../components/ChecklistTitleRow";
import { ChecklistItemRow } from "../../components/ChecklistItemRow";
import { SelectionCheckbox } from "../../components/SelectionCheckbox";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { PageTransition } from "../../components/PageTransition";
import { checklistDetailRoute, nuevaNotaRoute } from "../../utils/routes";
import { navigateForward } from "../../utils/navigation";

export default function TodoScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const showFavoritesOnly = useNotesStore((s) => s.showFavoritesOnly);
  const { selectionMode, isSelected, handlePress } = useItemSelection("checklist");

  const filteredChecklists = useMemo(
    () => filterChecklists(store.checklists, searchQuery, showFavoritesOnly),
    [store.checklists, searchQuery, showFavoritesOnly],
  );

  const renderTodoRow = (
    checklistId: string,
    item: { id: string; task: string; isCompleted: boolean },
  ) => (
    <ChecklistItemRow key={item.id} checklistId={checklistId} item={item} />
  );

  const renderChecklist = ({ item }: { item: ChecklistNote }) => {
    const selected = isSelected(item.id);

    return (
      <Pressable
        onPress={() =>
          handlePress(item.id, () =>
            navigateForward(router, checklistDetailRoute(item.id)),
          )
        }
        style={[
          { marginBottom: spacing.md },
          selected && {
            borderWidth: 2,
            borderColor: colors.accent,
            borderRadius: 12,
            padding: spacing.sm,
          },
        ]}
      >
        {selectionMode ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.sm }}>
            <SelectionCheckbox selected={selected} />
            <Text
              style={[sharedStyles.subtitleText, { color: colors.accent, flex: 1, marginBottom: 0 }]}
              numberOfLines={1}
            >
              {item.title || "Checklist sin título"}
            </Text>
          </View>
        ) : (
          <ChecklistTitleRow checklist={item} />
        )}
        {!selectionMode && item.items.map((todo) => renderTodoRow(item.id, todo))}
      </Pressable>
    );
  };

  return (
    <PageTransition variant="tab" routeKey="todo">
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
            To Do
          </Text>
        </View>
        {!selectionMode && (
          <AddButton
            onPress={() =>
              navigateForward(router, nuevaNotaRoute("checklist"))
            }
          />
        )}
        {filteredChecklists.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
            <Text style={[sharedStyles.bodyText, { color: colors.textSecondary }]}>
              {showFavoritesOnly
                ? "No hay listas favoritas"
                : searchQuery.trim()
                  ? "No hay tareas que coincidan con tu búsqueda"
                  : "No hay tareas todavía"}
            </Text>
          </View>
        ) : (
          <FlashList
            data={filteredChecklists}
            renderItem={renderChecklist}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
    </ResponsiveShell>
    </PageTransition>
  );
}
