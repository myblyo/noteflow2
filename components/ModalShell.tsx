import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeColors } from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";

interface ModalShellProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  maxWidth?: number;
}

/** Centra y limita el ancho de pantallas modales en tablet/desktop */
export function ModalShell({ children, style, maxWidth }: ModalShellProps) {
  const colors = useThemeColors();
  const { modalMaxWidth, isMobile } = useResponsive();
  const resolvedMaxWidth = maxWidth ?? modalMaxWidth;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          {
            flex: 1,
            minHeight: 0,
            width: "100%",
            maxWidth: isMobile ? undefined : resolvedMaxWidth,
            alignSelf: "center",
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
