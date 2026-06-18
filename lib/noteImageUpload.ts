import { addNoteAttachment } from "./api";
import { uploadBlobToS3, uploadToS3 } from "./s3Upload";
import type { ImageBlock, NoteDocument } from "../types/noteDocument";
import { serializeNoteDocument } from "../utils/noteDocument";
import { updateImageBlock } from "../utils/noteDocumentEdits";

export async function uploadImageBlock(
  block: ImageBlock,
  noteId: string,
  blob?: Blob,
): Promise<ImageBlock> {
  const publicUrl = blob
    ? await uploadBlobToS3(blob, {
        folder: "notes",
        fileName: block.fileName ?? `image-${block.id}.jpg`,
        contentType: block.mimeType ?? "image/jpeg",
      })
    : await uploadToS3(block.url, {
        folder: "notes",
        fileName: block.fileName ?? `image-${block.id}.jpg`,
        contentType: block.mimeType ?? "image/jpeg",
      });

  const saved = await addNoteAttachment(noteId, publicUrl);
  return {
    ...block,
    url: publicUrl,
    attachmentId: saved.id,
    status: "saved",
    error: undefined,
  };
}

export async function flushDocumentUploads(
  doc: NoteDocument,
  noteId: string,
  blobs: Map<string, Blob>,
): Promise<NoteDocument> {
  let next = doc;

  for (const block of doc.blocks) {
    if (block.type !== "image") continue;
    if (block.status !== "preview" && block.status !== "error") continue;

    next = updateImageBlock(next, block.id, { status: "uploading", error: undefined });

    try {
      const uploaded = await uploadImageBlock(block, noteId, blobs.get(block.id));
      next = updateImageBlock(next, block.id, uploaded);
    } catch (error) {
      next = updateImageBlock(next, block.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Error al subir",
      });
      throw error;
    }
  }

  return next;
}

export function getSerializedAfterUpload(doc: NoteDocument): string {
  return serializeNoteDocument(doc);
}
