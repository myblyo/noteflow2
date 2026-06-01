import { View, Text } from "react-native";
import { useNotesStore } from "../../../store/noteStore";

export default function IdeasScreen() {
  const ideas = useNotesStore((state) => state.ideas);

  return (
    <View>
      <Text>Ideas</Text>

      {ideas.map((idea) => (
        <View key={idea.id}>
          <Text>{idea.title}</Text>
          <Text>{idea.tags.join(", ")}</Text>
        </View>
      ))}
    </View>
  );
}