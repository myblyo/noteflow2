import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useThemeColors } from "../hooks/useTheme";

export default function RootLayout() {
  const colors = useThemeColors();

  return (
    <>
      <StatusBar style={colors.statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="tabs" />
      </Stack>
    </>
  );
}
