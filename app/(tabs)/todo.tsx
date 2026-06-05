import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing } from "../../constants/theme";
import { sharedStyles } from "../../constants/sharedStyles";
import { FlashList } from "@shopify/flash-list";
import { ChecklistNote } from "../../types";
import { filterChecklists } from "../../utils/filterItems";

export default function TodoScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();
  const searchQuery = useNotesStore((s) => s.searchQuery);

  const filteredChecklists = useMemo(
    () => filterChecklists(store.checklists, searchQuery),
    [store.checklists, searchQuery],
  );

  const renderTodoRow = (checklistId: string, item: any) => (
    <Pressable
      key={item.id}
      style={[sharedStyles.listItem, { backgroundColor: colors.surfaceTranslucent }]}
      onPress={() => store.toggleChecklistItem(checklistId, item.id)}
    >
      <View
        style={[
          sharedStyles.checkbox,
          { borderColor: colors.textPrimary },
          item.isCompleted && { backgroundColor: colors.textPrimary },
        ]}
      >
        {item.isCompleted && (
          <Ionicons name="checkmark" size={16} color={colors.surface} />
        )}
      </View>
      <Text
        style={[
          sharedStyles.subtitleText,
          {
            color: colors.textPrimary,
            flex: 1,
            marginLeft: spacing.md,
            textDecorationLine: item.isCompleted ? "line-through" : "none",
            opacity: item.isCompleted ? 0.6 : 1,
          },
        ]}
      >
        {item.task}
      </Text>
    </Pressable>
  );

  const renderChecklist = ({ item }: { item: ChecklistNote }) => (
    <View>
      <Pressable
        onPress={() => router.push(`/checklist/${item.id}`)}
        style={{ marginBottom: spacing.sm }}
      >
        <Text style={[sharedStyles.subtitleText, { color: colors.accent }]}>
          {item.title || "Checklist sin título"}
        </Text>
      </Pressable>

      {item.items.map((todo) =>
        renderTodoRow(item.id, todo)
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[sharedStyles.root, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <View style={sharedStyles.body}>
        <View
          style={[
            sharedStyles.listContainer,
            sharedStyles.fullWidthPanel,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <View style={sharedStyles.panelHeader}>
            <Text style={[sharedStyles.titleText, { color: colors.textSecondary }]}>
              To Do
            </Text>
          </View>
          <Pressable
            onPress={() => {
              const newChecklist = {
                id: crypto.randomUUID(),
                title: "",
                isFavorite: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                items: [],
              };
              store.addChecklist(newChecklist);
              router.push(`/checklist/${newChecklist.id}`);
            }}
            style={sharedStyles.addButton}
          >
            <Ionicons name="add" size={24} color={colors.textPrimary} />
          </Pressable>
          {filteredChecklists.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
              <Text style={[sharedStyles.bodyText, { color: colors.textSecondary }]}>
                {searchQuery.trim()
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
      </View>
    </SafeAreaView>
  );
}
