import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { getToken } from "../lib/token";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const isReady = useAuthStore((s) => s.isReady);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    getToken().then((token) => setHasToken(!!token));
  }, [isReady]);

  if (!isReady || hasToken === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={hasToken ? "/(tabs)" : "/login"} />;
}
