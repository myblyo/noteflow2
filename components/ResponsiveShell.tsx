import React from "react";
import { View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeColors } from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { sharedStyles } from "../constants/sharedStyles";

interface ResponsiveShellProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Contenedor centrado con ancho máximo adaptado al tamaño de pantalla */
export function ResponsiveShell({ children, style }: ResponsiveShellProps) {
  const colors = useThemeColors();
  const { shellBody } = useResponsive();

  return (
    <SafeAreaView
      style={[sharedStyles.root, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <View style={[shellBody, style]}>{children}</View>
    </SafeAreaView>
  );
}
