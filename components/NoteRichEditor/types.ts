export type NoteRichEditorRef = {
  hasPendingUploads: () => boolean;
  flushPendingUploads: (noteId: string) => Promise<string>;
  isEmpty: () => boolean;
};
