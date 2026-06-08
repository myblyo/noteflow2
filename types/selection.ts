export type SelectionItemType = "note" | "idea" | "checklist";

export interface SelectedItem {
  id: string;
  type: SelectionItemType;
}
