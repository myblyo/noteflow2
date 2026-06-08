import { useNotesStore } from "../store/noteStore";
import type { SelectionItemType } from "../types/selection";

export function useItemSelection(itemType: SelectionItemType) {
  const selectionMode = useNotesStore((s) => s.selectionMode);
  const selectedItems = useNotesStore((s) => s.selectedItems);
  const toggleItemSelected = useNotesStore((s) => s.toggleItemSelected);

  const isSelected = (id: string) =>
    selectedItems.some((item) => item.id === id && item.type === itemType);

  const handlePress = (id: string, onNormalPress: () => void) => {
    if (selectionMode) {
      toggleItemSelected(id, itemType);
      return;
    }
    onNormalPress();
  };

  return { selectionMode, isSelected, handlePress };
}
