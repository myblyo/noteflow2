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

export type NoteListItem = NoteWithRelations & {
  attachment_preview?: string | null;
  attachment_count?: number;
};

const NOTES_WITH_ATTACHMENTS_SQL = `
  SELECT n.*,
    (
      SELECT na.url
      FROM note_attachments na
      WHERE na.note_id = n.id
      ORDER BY na.created_at ASC
      LIMIT 1
    ) AS attachment_preview,
    (
      SELECT COUNT(*)::int
      FROM note_attachments na
      WHERE na.note_id = n.id
    ) AS attachment_count
  FROM notes n
  WHERE n.user_id = $1
  ORDER BY n.created_at DESC
`;

const NOTES_BASIC_SQL = `
  SELECT n.*,
    NULL::text AS attachment_preview,
    0::int AS attachment_count
  FROM notes n
  WHERE n.user_id = $1
  ORDER BY n.created_at DESC
`;

export async function listNotesForUser(userId: string): Promise<NoteListItem[]> {
  let rows: Array<
    NoteRow & { attachment_preview?: string | null; attachment_count?: number }
  >;
  try {
    rows = await query(NOTES_WITH_ATTACHMENTS_SQL, [userId]);
  } catch {
    rows = await query(NOTES_BASIC_SQL, [userId]);
  }

  if (!rows.length) return [];

  const noteIds = rows.map((note) => note.id);
  const tags = await query<{ note_id: string; tag: string }>(
    "SELECT note_id, tag FROM note_tags WHERE note_id = ANY($1::uuid[]) ORDER BY tag",
    [noteIds],
  );
  const items = await query<ItemRow & { note_id: string }>(
    "SELECT note_id, id, task, is_completed, position FROM checklist_items WHERE note_id = ANY($1::uuid[]) ORDER BY position",
    [noteIds],
  );

  const tagsByNote = new Map<string, string[]>();
  for (const { note_id, tag } of tags) {
    const list = tagsByNote.get(note_id) ?? [];
    list.push(tag);
    tagsByNote.set(note_id, list);
  }

  const itemsByNote = new Map<
    string,
    Array<{ id: string; task: string; is_completed: boolean }>
  >();
  for (const { note_id, id, task, is_completed } of items) {
    const list = itemsByNote.get(note_id) ?? [];
    list.push({ id, task, is_completed });
    itemsByNote.set(note_id, list);
  }

  return rows.map((note) => ({
    ...note,
    tags: tagsByNote.get(note.id) ?? [],
    items: itemsByNote.get(note.id) ?? [],
  }));
}

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
