import type {
  ImageBlock,
  NoteBlock,
  NoteDocument,
  TextBlock,
} from "../types/noteDocument";
import { RICH_CONTENT_PREFIX } from "../types/noteDocument";

export function newBlockId(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isRichNoteContent(content: string): boolean {
  return content.trimStart().startsWith(RICH_CONTENT_PREFIX);
}

export function emptyDocument(): NoteDocument {
  return { version: 1, blocks: [{ type: "text", id: newBlockId(), text: "" }] };
}

export function plainTextToDocument(text: string): NoteDocument {
  const trimmed = text.trim();
  if (!trimmed) return emptyDocument();
  return {
    version: 1,
    blocks: [{ type: "text", id: newBlockId(), text }],
  };
}

export function parseNoteContent(content: string): NoteDocument {
  if (!content?.trim()) return emptyDocument();
  if (!isRichNoteContent(content)) return plainTextToDocument(content);

  try {
    const parsed = JSON.parse(content) as NoteDocument;
    if (parsed?.version !== 1 || !Array.isArray(parsed.blocks)) {
      return plainTextToDocument(content);
    }
    const blocks = parsed.blocks
      .map(normalizeBlock)
      .filter((block): block is NoteBlock => block !== null);
    if (blocks.length === 0) return emptyDocument();
    return { version: 1, blocks };
  } catch {
    return plainTextToDocument(content);
  }
}

function normalizeBlock(raw: unknown): NoteBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const block = raw as Record<string, unknown>;

  if (block.type === "text" && typeof block.id === "string") {
    return {
      type: "text",
      id: block.id,
      text: typeof block.text === "string" ? block.text : "",
    };
  }

  if (block.type === "image" && typeof block.id === "string" && typeof block.url === "string") {
    return {
      type: "image",
      id: block.id,
      url: block.url,
      attachmentId: typeof block.attachmentId === "string" ? block.attachmentId : undefined,
      fileName: typeof block.fileName === "string" ? block.fileName : undefined,
      mimeType: typeof block.mimeType === "string" ? block.mimeType : undefined,
      width: typeof block.width === "number" ? block.width : 280,
      height: typeof block.height === "number" ? block.height : undefined,
      wrap:
        block.wrap === "inline" ||
        block.wrap === "square" ||
        block.wrap === "topBottom" ||
        block.wrap === "free"
          ? block.wrap
          : "square",
      align:
        block.align === "left" || block.align === "center" || block.align === "right"
          ? block.align
          : "left",
      x: typeof block.x === "number" ? block.x : undefined,
      y: typeof block.y === "number" ? block.y : undefined,
      status:
        block.status === "preview" ||
        block.status === "uploading" ||
        block.status === "saved" ||
        block.status === "error"
          ? block.status
          : "saved",
      error: typeof block.error === "string" ? block.error : undefined,
    };
  }

  return null;
}

export function serializeNoteDocument(doc: NoteDocument): string {
  return JSON.stringify(doc);
}

export function getPlainTextFromContent(content: string): string {
  const doc = parseNoteContent(content);
  return doc.blocks
    .filter((block): block is TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export function getImageBlocksFromContent(content: string): ImageBlock[] {
  return parseNoteContent(content).blocks.filter(
    (block): block is ImageBlock => block.type === "image",
  );
}

export function getSavedImageUrls(content: string): string[] {
  return getImageBlocksFromContent(content)
    .filter((block) => block.status === "saved" && block.url && !block.url.startsWith("blob:"))
    .map((block) => block.url);
}

export function mergeAttachmentsIntoDocument(
  content: string,
  attachmentUrls: string[],
): NoteDocument {
  const doc = parseNoteContent(content);
  const existing = new Set(
    getImageBlocksFromContent(content)
      .map((block) => block.url)
      .filter(Boolean),
  );

  const missing = attachmentUrls.filter((url) => !existing.has(url));
  if (missing.length === 0) return doc;

  const blocks = [...doc.blocks];
  for (const url of missing) {
    blocks.push({
      type: "image",
      id: newBlockId(),
      url,
      width: 280,
      wrap: "square",
      align: "left",
      status: "saved",
    });
  }
  return { version: 1, blocks };
}

export function documentHasPendingUploads(doc: NoteDocument): boolean {
  return doc.blocks.some(
    (block) =>
      block.type === "image" &&
      (block.status === "preview" || block.status === "uploading"),
  );
}

export function documentIsEmpty(doc: NoteDocument): boolean {
  const hasText = doc.blocks.some(
    (block) => block.type === "text" && block.text.trim().length > 0,
  );
  const hasImage = doc.blocks.some((block) => block.type === "image");
  return !hasText && !hasImage;
}
