import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const isReady = useAuthStore((s) => s.isReady);
  const user = useAuthStore((s) => s.user);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={user ? "/(tabs)" : "/login"} />;
}
