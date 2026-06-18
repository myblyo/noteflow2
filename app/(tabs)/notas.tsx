import React, { useMemo } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ResponsiveShell } from "../../components/ResponsiveShell";
import { PageTransition } from "../../components/PageTransition";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { useItemSelection } from "../../hooks/useItemSelection";
import { sharedStyles } from "../../constants/sharedStyles";
import type { Note } from "../../types";
import { spacing } from "../../constants/theme";
import { FlashList } from "@shopify/flash-list";
import { filterNotes } from "../../utils/filterItems";
import { formatDate } from "../../utils/formatDate";
import { noteDetailRoute, nuevaNotaRoute } from "../../utils/routes";
import { navigateForward } from "../../utils/navigation";
import { AddButton } from "../../components/AddButton";
import { FavoriteStarButton } from "../../components/FavoriteStarButton";
import { SelectionCheckbox } from "../../components/SelectionCheckbox";
import { RemoteImage } from "../../components/RemoteImage";
import { getPlainTextFromContent } from "../../utils/noteDocument";

export default function NotasScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const showFavoritesOnly = useNotesStore((s) => s.showFavoritesOnly);
  const { selectionMode, isSelected, handlePress } = useItemSelection("note");

  const filteredNotes = useMemo(
    () => filterNotes(store.notes, searchQuery, showFavoritesOnly),
    [store.notes, searchQuery, showFavoritesOnly],
  );

  const renderNoteCard = (note: Note) => {
    const selected = isSelected(note.id);
    const editorSelected = store.selectedNoteId === note.id;

    return (
      <Pressable
        key={note.id}
        onPress={() =>
          handlePress(note.id, () => navigateForward(router, noteDetailRoute(note.id)))
        }
        style={[
          sharedStyles.listItem,
          {
            backgroundColor:
              selected || editorSelected ? colors.surface : colors.surfaceTranslucent,
            borderWidth: selected ? 2 : 0,
            borderColor: selected ? colors.accent : "transparent",
          },
          (selected || editorSelected) &&
            Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.05,
                shadowRadius: 32,
              },
              android: { elevation: 2 },
            }),
        ]}
      >
        {selectionMode && <SelectionCheckbox selected={selected} />}

        <View style={sharedStyles.listItemContent}>
          <Text
            style={[sharedStyles.subtitleText, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {note.title || "Sin título"}
          </Text>
          <Text
            style={[sharedStyles.bodyText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {getPlainTextFromContent(note.content) || "Sin contenido"}
          </Text>
          {(note.attachmentCount ?? 0) > 0 && note.attachmentPreviewUrl ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: spacing.xs,
                gap: spacing.xs,
              }}
            >
              <RemoteImage
                uri={note.attachmentPreviewUrl}
                style={{ width: 36, height: 36, borderRadius: 6 }}
              />
              {(note.attachmentCount ?? 0) > 1 ? (
                <Text
                  style={[
                    sharedStyles.bodyText,
                    { color: colors.textTertiary, fontSize: 12 },
                  ]}
                >
                  +{(note.attachmentCount ?? 0) - 1}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={sharedStyles.noteCardRight}>
          {!selectionMode && (
            <View style={[sharedStyles.datePill, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[sharedStyles.dateText, { color: colors.textPrimary }]}>
                {formatDate(note.createdAt, "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}
          {!selectionMode && (
            <FavoriteStarButton
              isFavorite={note.isFavorite}
              onPress={() => store.toggleNoteFavorite(note.id)}
            />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <PageTransition variant="tab" routeKey="notas">
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
              Notas
            </Text>
          </View>
          {!selectionMode && (
            <AddButton onPress={() => navigateForward(router, nuevaNotaRoute())} />
          )}
          {filteredNotes.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
              <Text style={[sharedStyles.bodyText, { color: colors.textSecondary }]}>
                {showFavoritesOnly
                  ? "No hay notas favoritas"
                  : searchQuery.trim()
                    ? "No hay notas que coincidan con tu búsqueda"
                    : "No hay notas todavía"}
              </Text>
            </View>
          ) : (
            <FlashList
              data={filteredNotes}
              renderItem={({ item }) => renderNoteCard(item)}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.md, paddingTop: spacing.md }}
            />
          )}
        </View>
      </ResponsiveShell>
    </PageTransition>
  );
}
