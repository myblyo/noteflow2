import type { ChecklistItem } from "../types";

export function getChecklistProgress(items: ChecklistItem[]) {
  const total = items.length;
  const completed = items.filter((item) => item.isCompleted).length;

  return {
    completed,
    total,
    ratio: total > 0 ? completed / total : 0,
  };
}
