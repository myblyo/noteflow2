import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useNotesStore } from "../../store/noteStore";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing } from "../../constants/theme";
import { sharedStyles } from "../../constants/sharedStyles";
import type { IdeaNote } from "../../types";

import { FlashList } from "@shopify/flash-list";

export default function IdeasScreen() {
  const colors = useThemeColors();
  const store = useNotesStore();
  const router = useRouter();

  const handleAddIdea = () => {
    const newIdea: IdeaNote = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      tags: [],
      color: "#6366F1",
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.addIdea(newIdea);
    router.push(`/idea/${newIdea.id}`);
  };

  const renderIdeaRow = ({ item }: { item: IdeaNote }) => (
    <Pressable
      onPress={() => router.push(`/idea/${item.id}`)}
      style={[
        sharedStyles.listItem,
        { backgroundColor: colors.surfaceTranslucent },
      ]}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: item.color,
          marginRight: spacing.sm,
        }}
      />

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

      <Pressable
        onPress={() => store.toggleIdeaFavorite(item.id)}
        hitSlop={8}
      >
        <Ionicons
          name={item.isFavorite ? "star" : "star-outline"}
          size={20}
          color={colors.textPrimary}
        />
      </Pressable>
    </Pressable>
  );

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
              Ideas
            </Text>
          </View>
          <Pressable onPress={handleAddIdea} style={sharedStyles.addButton}>
            <Ionicons name="add" size={24} color={colors.textPrimary} />
          </Pressable>
          <FlashList
            data={store.ideas}
            renderItem={renderIdeaRow}
            keyExtractor={(item) => item.id}
            estimatedItemSize={120}
            contentContainerStyle={sharedStyles.centeredListContent}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
