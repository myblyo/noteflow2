    import { View, Text } from "react-native";
    import { useNotesStore } from "../../store/noteStore";

    export default function ChecklistsScreen() {
    const checklists = useNotesStore((state) => state.checklists);

    return (
        <View>
        <Text>Checklists</Text>

        {checklists.map((item) => (
            <View key={item.id}>
            <Text>{item.title}</Text>
            <Text>{item.items.length} tareas</Text>
            </View>
        ))}
        </View>
    );
    }