import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// Si usas UI library (ej: Gluestack / Paper), aquí va su Provider
// import { GluestackUIProvider } from "@gluestack-ui/themed";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* <GluestackUIProvider> */}

      <StatusBar style="auto" />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Tabs como pantalla principal */}
        <Stack.Screen name="(tabs)" />

        {/* Modal de nueva nota */}
        <Stack.Screen
          name="nueva-note"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>

      {/* </GluestackUIProvider> */}
    </SafeAreaProvider>
  );
}