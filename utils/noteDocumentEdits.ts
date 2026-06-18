import type { ImageBlock, NoteBlock, NoteDocument, TextBlock } from "../types/noteDocument";
import { newBlockId } from "./noteDocument";

export type CaretPosition = {
  blockId: string;
  offset: number;
};

export function findBlockIndex(doc: NoteDocument, blockId: string): number {
  return doc.blocks.findIndex((block) => block.id === blockId);
}

export function updateTextBlock(
  doc: NoteDocument,
  blockId: string,
  text: string,
): NoteDocument {
  return {
    version: 1,
    blocks: doc.blocks.map((block) =>
      block.id === blockId && block.type === "text" ? { ...block, text } : block,
    ),
  };
}

export function insertImageAtCaret(
  doc: NoteDocument,
  caret: CaretPosition | null,
  image: ImageBlock,
): NoteDocument {
  if (!caret) {
    return appendBlock(doc, image);
  }

  const index = findBlockIndex(doc, caret.blockId);
  if (index === -1) return appendBlock(doc, image);

  const block = doc.blocks[index];
  if (block.type !== "text") {
    const blocks = [...doc.blocks];
    blocks.splice(index + 1, 0, image);
    return { version: 1, blocks };
  }

  const before = block.text.slice(0, caret.offset);
  const after = block.text.slice(caret.offset);
  const replacement: NoteBlock[] = [];

  if (before.length > 0) {
    replacement.push({ type: "text", id: newBlockId(), text: before });
  }
  replacement.push(image);
  if (after.length > 0) {
    replacement.push({ type: "text", id: newBlockId(), text: after });
  }
  if (replacement.length === 0) {
    replacement.push(image);
  }

  const blocks = [...doc.blocks];
  blocks.splice(index, 1, ...replacement);
  return { version: 1, blocks };
}

export function insertImageAtIndex(
  doc: NoteDocument,
  index: number,
  image: ImageBlock,
): NoteDocument {
  const blocks = [...doc.blocks];
  const safeIndex = Math.max(0, Math.min(index, blocks.length));
  blocks.splice(safeIndex, 0, image);
  return { version: 1, blocks };
}

export function appendBlock(doc: NoteDocument, block: NoteBlock): NoteDocument {
  return { version: 1, blocks: [...doc.blocks, block] };
}

export function moveBlock(
  doc: NoteDocument,
  fromIndex: number,
  toIndex: number,
): NoteDocument {
  if (fromIndex === toIndex) return doc;
  const blocks = [...doc.blocks];
  const [moved] = blocks.splice(fromIndex, 1);
  const adjusted = fromIndex < toIndex ? toIndex - 1 : toIndex;
  blocks.splice(adjusted, 0, moved);
  return { version: 1, blocks };
}

export function updateImageBlock(
  doc: NoteDocument,
  blockId: string,
  patch: Partial<ImageBlock>,
): NoteDocument {
  return {
    version: 1,
    blocks: doc.blocks.map((block) =>
      block.id === blockId && block.type === "image" ? { ...block, ...patch } : block,
    ),
  };
}

export function removeBlock(doc: NoteDocument, blockId: string): NoteDocument {
  const blocks = doc.blocks.filter((block) => block.id !== blockId);
  if (blocks.length === 0) {
    return { version: 1, blocks: [{ type: "text", id: newBlockId(), text: "" }] };
  }
  return { version: 1, blocks: mergeAdjacentText(blocks) };
}

function mergeAdjacentText(blocks: NoteBlock[]): NoteBlock[] {
  const merged: NoteBlock[] = [];
  for (const block of blocks) {
    const last = merged[merged.length - 1];
    if (block.type === "text" && last?.type === "text") {
      last.text += block.text;
    } else {
      merged.push({ ...block });
    }
  }
  return merged;
}

export function getDropInsertIndex(
  blockTops: Array<{ id: string; top: number; bottom: number }>,
  clientY: number,
): number {
  if (blockTops.length === 0) return 0;

  for (let i = 0; i < blockTops.length; i++) {
    const rect = blockTops[i];
    const mid = rect.top + (rect.bottom - rect.top) / 2;
    if (clientY < mid) return i;
  }
  return blockTops.length;
}

export function createImageBlockFromFile(file: File, previewUrl: string): ImageBlock {
  return {
    type: "image",
    id: newBlockId(),
    url: previewUrl,
    fileName: file.name,
    mimeType: file.type || "image/jpeg",
    width: Math.min(320, Math.max(160, Math.round(file.size > 0 ? 280 : 280))),
    wrap: "square",
    align: "left",
    status: "preview",
  };
}

export function getCaretFromSelection(doc: NoteDocument): CaretPosition | null {
  if (typeof window === "undefined") return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return null;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  const element =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement);

  const blockEl = element?.closest("[data-block-id][data-block-type='text']");
  if (!blockEl) return null;

  const blockId = blockEl.getAttribute("data-block-id");
  if (!blockId || findBlockIndex(doc, blockId) === -1) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(blockEl);
  preRange.setEnd(range.startContainer, range.startOffset);
  const offset = preRange.toString().length;

  return { blockId, offset };
}

export function focusTextBlock(blockId: string, offset = 0) {
  if (typeof document === "undefined") return;
  const el = document.querySelector(`[data-block-id="${blockId}"][data-block-type="text"]`);
  if (!el) return;

  const range = document.createRange();
  const selection = window.getSelection();
  const textNode = findTextNodeAtOffset(el, offset);
  if (!textNode) {
    range.selectNodeContents(el);
    range.collapse(false);
  } else {
    range.setStart(textNode.node, textNode.offset);
    range.collapse(true);
  }
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function findTextNodeAtOffset(
  root: Element,
  targetOffset: number,
): { node: Node; offset: number } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;
  let node = walker.nextNode();
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (currentOffset + length >= targetOffset) {
      return { node, offset: targetOffset - currentOffset };
    }
    currentOffset += length;
    node = walker.nextNode();
  }
  return null;
}
