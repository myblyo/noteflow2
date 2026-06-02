import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../hooks/useTheme";

export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          marginHorizontal: "10%",
          marginBottom: 24,
          height: 64,
          borderRadius: 32,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "All",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notas"
        options={{
          title: "Notas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: "Ideas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: "To Do",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
