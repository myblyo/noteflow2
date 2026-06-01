import { Stack } from "expo-router";
import { useThemeColors } from "../hooks/useTheme";

export default function RootLayout() {
  const colors = useThemeColors();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" />
    </Stack>
  );
}