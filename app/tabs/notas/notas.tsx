    import { View, Text, Button } from "react-native";
import { useNotesStore } from "../../../store/noteStore";


    export default function NotasScreen() {
        const notes = useNotesStore((state) => state.notes);

        return (
            <View>
                <Text>Notas</Text>

        {notes.map((note) => (
            <View key={note.id}>
            <Text>{note.title}</Text>
            <Text>{note.content}</Text>
            <Text>{note.createdAt.toString()}</Text>
            <Text>{note.updateAt.toString()}</Text>
            </View>
        ))}
        </View>
    );
    }