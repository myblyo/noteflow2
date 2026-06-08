import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../hooks/useTheme";
import { SearchBar } from "../../components/SearchBar";
import { SelectionBar } from "../../components/SelectionBar";

export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: 8 }}>
        <SearchBar />
        <SelectionBar />
      </View>

      <View style={{ flex: 1, minHeight: 0 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.tabActive,
            tabBarInactiveTintColor: colors.tabInactive,
            tabBarShowLabel: false,
            tabBarStyle: { display: "none" },
            sceneStyle: { flex: 1 },
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
      </View>
    </View>
  );
}
