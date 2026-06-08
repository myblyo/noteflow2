import { query } from "@/lib/db";

export async function noteBelongsToUser(
  noteId: string,
  userId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
    [noteId, userId],
  );
  return rows.length > 0;
}

export async function checklistItemBelongsToUser(
  itemId: string,
  userId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `SELECT ci.id
     FROM checklist_items ci
     INNER JOIN notes n ON n.id = ci.note_id
     WHERE ci.id = $1 AND n.user_id = $2`,
    [itemId, userId],
  );
  return rows.length > 0;
}
