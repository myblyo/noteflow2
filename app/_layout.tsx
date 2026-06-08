import { Stack } from "expo-router";
import { useThemeColors } from "../hooks/useTheme";
import { AppShell } from "../components/AppShell";
import { TRANSITION } from "../constants/transitions";

export default function RootLayout() {
  const colors = useThemeColors();

  return (
    <AppShell>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
          animationDuration: TRANSITION.duration,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="nota/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="idea/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checklist/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="nueva-nota" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    </AppShell>
  );
}
