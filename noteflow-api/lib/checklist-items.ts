import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

export type ChecklistItem = {
  id: string;
  note_id: string;
  task: string;
  is_completed: boolean;
  position: number;
};

export async function listChecklistItems(
  noteId: string,
): Promise<ChecklistItem[]> {
  return query<ChecklistItem>(
    `SELECT id, note_id, task, is_completed, position
     FROM checklist_items
     WHERE note_id = $1
     ORDER BY position`,
    [noteId],
  );
}

export async function createChecklistItem(
  noteId: string,
  task: string,
  isCompleted = false,
): Promise<ChecklistItem> {
  const [positionRow] = await query<{ next: number }>(
    `SELECT COALESCE(MAX(position), -1) + 1 AS next
     FROM checklist_items WHERE note_id = $1`,
    [noteId],
  );
  const id = randomUUID();
  const [item] = await query<ChecklistItem>(
    `INSERT INTO checklist_items (id, note_id, task, is_completed, position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, note_id, task, is_completed, position`,
    [id, noteId, task, isCompleted, positionRow?.next ?? 0],
  );
  return item;
}

export async function getChecklistItem(
  itemId: string,
): Promise<ChecklistItem | null> {
  const [item] = await query<ChecklistItem>(
    `SELECT id, note_id, task, is_completed, position
     FROM checklist_items WHERE id = $1`,
    [itemId],
  );
  return item ?? null;
}

export async function toggleChecklistItem(
  itemId: string,
  isCompleted?: boolean,
): Promise<ChecklistItem | null> {
  const [item] = await query<ChecklistItem>(
    isCompleted === undefined
      ? `UPDATE checklist_items
         SET is_completed = NOT is_completed
         WHERE id = $1
         RETURNING id, note_id, task, is_completed, position`
      : `UPDATE checklist_items
         SET is_completed = $2
         WHERE id = $1
         RETURNING id, note_id, task, is_completed, position`,
    isCompleted === undefined ? [itemId] : [itemId, isCompleted],
  );
  return item ?? null;
}

export async function deleteChecklistItem(itemId: string): Promise<boolean> {
  const deleted = await query<{ id: string }>(
    "DELETE FROM checklist_items WHERE id = $1 RETURNING id",
    [itemId],
  );
  return deleted.length > 0;
}
