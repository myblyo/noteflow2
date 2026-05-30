import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View>
      <Text>HOME</Text>

      <Pressable onPress={() => router.push("/notas")}>
        <Text>Ir a notas</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/checklists")}>
        <Text>Ir a checklists</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/ideas")}>
        <Text>Ir a ideas</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/fulllayout")}>
        <Text>Ir a full layout</Text>
      </Pressable>

    </View>
  );
}