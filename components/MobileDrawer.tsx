import React from "react";
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../hooks/useTheme";

interface MobileDrawerProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileDrawer({ visible, onClose, children }: MobileDrawerProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.86, 340);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              backgroundColor: colors.background,
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerContent}
          >
            {children}
          </ScrollView>
        </View>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  drawer: {
    height: "100%",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  backdrop: {
    flex: 1,
  },
  drawerContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
