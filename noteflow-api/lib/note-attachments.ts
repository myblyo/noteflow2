import { query } from "@/lib/db";

export type NoteAttachmentRow = {
  id: string;
  note_id: string;
  url: string;
  owner_id: string;
  created_at: string;
};

export async function listNoteAttachments(
  noteId: string,
): Promise<NoteAttachmentRow[]> {
  return query<NoteAttachmentRow>(
    `SELECT id, note_id, url, owner_id, created_at
     FROM note_attachments
     WHERE note_id = $1
     ORDER BY created_at ASC`,
    [noteId],
  );
}

export async function insertNoteAttachment(input: {
  noteId: string;
  url: string;
  ownerId: string;
}): Promise<NoteAttachmentRow> {
  const [row] = await query<NoteAttachmentRow>(
    `INSERT INTO note_attachments (note_id, url, owner_id)
     VALUES ($1, $2, $3)
     RETURNING id, note_id, url, owner_id, created_at`,
    [input.noteId, input.url, input.ownerId],
  );
  return row;
}

export async function deleteNoteAttachment(
  attachmentId: string,
  userId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM note_attachments na
     USING notes n
     WHERE na.id = $1
       AND na.note_id = n.id
       AND n.user_id = $2
     RETURNING na.id`,
    [attachmentId, userId],
  );
  return rows.length > 0;
}

export async function noteExists(noteId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "SELECT id FROM notes WHERE id = $1",
    [noteId],
  );
  return rows.length > 0;
}
