import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

type NoteRow = {
  id: string;
  title: string;
  type: string;
  content: string;
  color: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

type TagRow = { tag: string };
type ItemRow = {
  id: string;
  task: string;
  is_completed: boolean;
  position: number;
};

export type NoteWithRelations = NoteRow & {
  tags: string[];
  items: Array<{ id: string; task: string; is_completed: boolean }>;
};

export async function getNoteWithRelations(
  id: string,
  userId: string,
): Promise<NoteWithRelations | null> {
  const [note] = await query<NoteRow>(
    "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  if (!note) return null;

  const tags = await query<TagRow>(
    "SELECT tag FROM note_tags WHERE note_id = $1 ORDER BY tag",
    [id],
  );
  const items = await query<ItemRow>(
    "SELECT id, task, is_completed, position FROM checklist_items WHERE note_id = $1 ORDER BY position",
    [id],
  );

  return {
    ...note,
    tags: tags.map((t) => t.tag),
    items: items.map(({ id: itemId, task, is_completed }) => ({
      id: itemId,
      task,
      is_completed,
    })),
  };
}

export async function insertNoteRelations(
  noteId: string,
  tags?: string[],
  items?: Array<{ task: string; is_completed?: boolean }>,
) {
  if (tags?.length) {
    for (const tag of tags) {
      await query(
        "INSERT INTO note_tags (note_id, tag) VALUES ($1, $2)",
        [noteId, tag],
      );
    }
  }

  if (items?.length) {
    for (const [index, item] of items.entries()) {
      await query(
        "INSERT INTO checklist_items (id, note_id, task, is_completed, position) VALUES ($1, $2, $3, $4, $5)",
        [
          randomUUID(),
          noteId,
          item.task,
          item.is_completed ?? false,
          index,
        ],
      );
    }
  }
}

export async function replaceNoteTags(noteId: string, tags: string[]) {
  await query("DELETE FROM note_tags WHERE note_id = $1", [noteId]);
  await insertNoteRelations(noteId, tags);
}

export async function replaceNoteItems(
  noteId: string,
  items: Array<{ task: string; is_completed?: boolean }>,
) {
  await query("DELETE FROM checklist_items WHERE note_id = $1", [noteId]);
  await insertNoteRelations(noteId, undefined, items);
}
