import { useEffect, useState } from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import auth from "@react-native-firebase/auth";
import { useThemeColors } from "../hooks/useTheme";
import { AppShell } from "../components/AppShell";
import { TRANSITION } from "../constants/transitions";
import { fetchUserProfile, mapFirebaseUser } from "../lib/firebaseAuth";
import { useAuthStore } from "../store/authStore";
import { injectWebGlobalStyles } from "../utils/injectWebGlobalStyles";

const PUBLIC_ROUTES = new Set(["login", "register"]);

export default function RootLayout() {
  const colors = useThemeColors();
  const router = useRouter();
  const segments = useSegments();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const initWeb = useAuthStore((s) => s.initWeb);
  const initNative = useAuthStore((s) => s.initNative);

  const currentRoute = segments[0];

  useEffect(() => {
    if (Platform.OS === "web") {
      injectWebGlobalStyles();
      initWeb().finally(() => setCheckingAuth(false));
      return;
    }

    void initNative();

    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        await setSession(profile ?? mapFirebaseUser(firebaseUser));
      } else {
        await setSession(null);
      }
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, [initNative, initWeb, setSession]);

  useEffect(() => {
    if (checkingAuth) return;

    const isPublicRoute =
      !currentRoute ||
      currentRoute === "index" ||
      PUBLIC_ROUTES.has(currentRoute);

    if (!user && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (user && PUBLIC_ROUTES.has(currentRoute ?? "")) {
      router.replace("/(tabs)");
    }
  }, [checkingAuth, currentRoute, router, user]);

  if (checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

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
        <Stack.Screen name="perfil" options={{ headerShown: false }} />
      </Stack>
    </AppShell>
  );
}
