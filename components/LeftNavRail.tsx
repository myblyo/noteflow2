import React, { useEffect, useRef } from "react";
import { View, Pressable, StyleSheet, Animated } from "react-native";
import { SMOOTH_EASING, TRANSITION } from "../constants/transitions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius } from "../constants/theme";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { ProfileNavButton } from "./ProfileNavButton";
import { TAB_ROUTES, type TabRouteName } from "../utils/routes";
import { useNavTransitionStore } from "../store/navTransitionStore";

const TAB_SIZE = 44;
const TAB_GAP = spacing.sm;

const TABS: {
  name: TabRouteName;
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { name: "index", href: TAB_ROUTES.index, icon: "grid-outline", label: "All" },
  { name: "notas", href: TAB_ROUTES.notas, icon: "document-text-outline", label: "Notas" },
  { name: "ideas", href: TAB_ROUTES.ideas, icon: "bulb-outline", label: "Ideas" },
  { name: "todo", href: TAB_ROUTES.todo, icon: "checkbox-outline", label: "To Do" },
];

function tabOffset(index: number) {
  return index * (TAB_SIZE + TAB_GAP);
}

function animateIndicator(
  value: Animated.Value,
  index: number,
) {
  Animated.timing(value, {
    toValue: tabOffset(index),
    duration: TRANSITION.durationFast,
    easing: SMOOTH_EASING,
    useNativeDriver: true,
  }).start();
}

export function LeftNavRail() {
  const colors = useThemeColors();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const segmentList = segments as readonly string[];
  const rootSegment = segmentList[0];

  const activeTab: TabRouteName =
    rootSegment === "nota"
      ? "notas"
      : rootSegment === "idea"
        ? "ideas"
        : rootSegment === "checklist"
          ? "todo"
          : ((segmentList.find((s) => TABS.some((t) => t.name === s)) as
              | TabRouteName
              | undefined) ?? "index");

  const activeIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.name === activeTab),
  );

  const indicatorY = useRef(new Animated.Value(tabOffset(activeIndex))).current;

  useEffect(() => {
    animateIndicator(indicatorY, activeIndex);
  }, [activeIndex, indicatorY]);

  const handleTabPress = (tab: (typeof TABS)[number], index: number) => {
    if (tab.name === activeTab) return;

    animateIndicator(indicatorY, index);
    useNavTransitionStore.getState().setSlideByTabIndex(activeIndex, index);

    const onTabStack =
      rootSegment === "(tabs)" ||
      TABS.some((item) => item.name === rootSegment);

    if (onTabStack) {
      router.navigate(tab.href);
      return;
    }

    router.replace(tab.href);
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.sm,
          borderRightColor: colors.divider,
        },
      ]}
    >
      <View style={styles.tabs}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              backgroundColor: colors.accentLight,
              transform: [{ translateY: indicatorY }],
            },
          ]}
        />

        {TABS.map((tab, index) => {
          const isFocused = activeTab === tab.name;
          return (
            <Pressable
              key={tab.name}
              onPress={() => handleTabPress(tab, index)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={isFocused ? colors.tabActive : colors.tabInactive}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <ThemeToggleButton size={20} style={styles.themeButton} />
        <ProfileNavButton size={TAB_SIZE} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: 64,
    alignSelf: "stretch",
    borderRightWidth: StyleSheet.hairlineWidth,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabs: {
    position: "relative",
    gap: TAB_GAP,
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: "auto",
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: radius.lg,
  },
  tabButton: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  themeButton: {
    width: 40,
    height: 40,
  },
});
