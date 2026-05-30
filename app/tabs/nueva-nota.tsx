import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
    import { useNotesStore } from "../../store/noteStore";

export default function NuevaNota() {
    const addNote = useNotesStore((state) => state.addNote);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSave = () => {
        addNote({
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: new Date(),
            updateAt: new Date(),
        });

        setTitle("");
        setContent("");
    };

    return (
        <View>
        <Text>Nueva Nota</Text>

        <TextInput
            placeholder="Título"
            value={title}
            onChangeText={setTitle}
        />

        <TextInput
            placeholder="Contenido"
            value={content}
            onChangeText={setContent}
        />

        <Button title="Guardar" onPress={handleSave} />
        </View>
    );
}