import React from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { sharedStyles } from "../../constants/sharedStyles";
import type { Note } from "../../types";
import { spacing } from "../../constants/theme";
import { FlashList } from "@shopify/flash-list";

export default function NotasScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  const handleAddNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addNote(newNote);
    router.push(`/nota/${newNote.id}`);
  };

  const renderNoteCard = (note: Note) => {
    const isSelected = store.selectedNoteId === note.id;
    return (
      <Pressable
        key={note.id}
        onPress={() => router.push(`/nota/${note.id}`)}
        style={[
          sharedStyles.listItem,
          { backgroundColor: isSelected ? colors.surface : colors.surfaceTranslucent },
          isSelected &&
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
            {note.content || "Sin contenido"}
          </Text>
        </View>

        <View style={sharedStyles.noteCardRight}>
          <View style={[sharedStyles.datePill, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[sharedStyles.dateText, { color: colors.textPrimary }]}>
              {note.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </Text>
          </View>
          <Pressable onPress={() => store.toggleNoteFavorite(note.id)} hitSlop={8}>
            <Ionicons
              name={note.isFavorite ? "star" : "star-outline"}
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[sharedStyles.root, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
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
              Notas
            </Text>
          </View>
          <Pressable onPress={handleAddNote} style={sharedStyles.addButton}>
            <Ionicons name="add" size={24} color={colors.textPrimary} />
          </Pressable>
          <FlashList
            data={store.notes}
            renderItem={({ item }) => renderNoteCard(item)}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={100}
            contentContainerStyle={{ paddingBottom: spacing.md, paddingTop: spacing.md }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
