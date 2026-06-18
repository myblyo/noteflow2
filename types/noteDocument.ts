export type ImageWrapMode = "inline" | "square" | "topBottom" | "free";

export type ImageAlign = "left" | "center" | "right";

export type ImageUploadStatus = "preview" | "uploading" | "saved" | "error";

export type TextBlock = {
  type: "text";
  id: string;
  text: string;
};

export type ImageBlock = {
  type: "image";
  id: string;
  url: string;
  attachmentId?: string;
  fileName?: string;
  mimeType?: string;
  width: number;
  height?: number;
  wrap: ImageWrapMode;
  align: ImageAlign;
  x?: number;
  y?: number;
  status: ImageUploadStatus;
  error?: string;
};

export type NoteBlock = TextBlock | ImageBlock;

export type NoteDocument = {
  version: 1;
  blocks: NoteBlock[];
};

export const RICH_CONTENT_PREFIX = '{"version":1,"blocks":';

export const WRAP_MODE_LABELS: Record<ImageWrapMode, string> = {
  inline: "En línea con el texto",
  square: "Ajustar texto",
  topBottom: "Romper texto",
  free: "Posición libre",
};
