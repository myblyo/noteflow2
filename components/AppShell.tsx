import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSegments } from "expo-router";

import { useAuthStore } from "../store/authStore";
import { useFetchNotes } from "../hooks/useFetchNotes";
import { useThemeColors } from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { LeftNavRail } from "./LeftNavRail";

interface AppShellProps {
  children: React.ReactNode;
}

/** Barra lateral + área de contenido en todas las pantallas */
export function AppShell({ children }: AppShellProps) {
  const initAuth = useAuthStore((s) => s.init);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useFetchNotes();
  const colors = useThemeColors();
  const { isMobile } = useResponsive();
  const segments = useSegments();
  const isAuthScreen = segments[0] === "login" || segments[0] === "register";

  if (isAuthScreen) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={isMobile ? [] : ["top"]}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <LeftNavRail />
        <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      </View>
    </SafeAreaView>
  );
}
