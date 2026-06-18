import type { ImageBlock, NoteBlock, TextBlock } from "../types/noteDocument";
import { newBlockId } from "./noteDocument";
import type { NoteDocument } from "../types/noteDocument";

export type TextSegment = { type: "text"; block: TextBlock };

export type SquareFlowSegment = {
  type: "square-flow";
  image: ImageBlock;
  textBlocks: TextBlock[];
};

export type InlineFlowSegment = {
  type: "inline-flow";
  blocks: Array<TextBlock | ImageBlock>;
};

export type TopBottomSegment = { type: "top-bottom"; image: ImageBlock };

export type FreeSegment = { type: "free"; image: ImageBlock };

export type DocumentSegment =
  | TextSegment
  | SquareFlowSegment
  | InlineFlowSegment
  | TopBottomSegment
  | FreeSegment;

export function groupBlocksIntoSegments(blocks: NoteBlock[]): DocumentSegment[] {
  const segments: DocumentSegment[] = [];
  const consumed = new Set<number>();

  for (let i = 0; i < blocks.length; i++) {
    if (consumed.has(i)) continue;
    const block = blocks[i];

    if (block.type === "text") {
      segments.push({ type: "text", block });
      consumed.add(i);
      continue;
    }

    const image = block;

    if (image.wrap === "free") {
      segments.push({ type: "free", image });
      consumed.add(i);
      continue;
    }

    if (image.wrap === "topBottom") {
      segments.push({ type: "top-bottom", image });
      consumed.add(i);
      continue;
    }

    if (image.wrap === "square") {
      const textBlocks: TextBlock[] = [];
      if (i > 0 && blocks[i - 1].type === "text" && !consumed.has(i - 1)) {
        textBlocks.push(blocks[i - 1] as TextBlock);
        consumed.add(i - 1);
      }
      let j = i + 1;
      while (j < blocks.length && blocks[j].type === "text") {
        textBlocks.push(blocks[j] as TextBlock);
        consumed.add(j);
        j++;
      }
      segments.push({ type: "square-flow", image, textBlocks });
      consumed.add(i);
      continue;
    }

    if (image.wrap === "inline") {
      const inlineBlocks: Array<TextBlock | ImageBlock> = [];
      if (i > 0 && blocks[i - 1].type === "text" && !consumed.has(i - 1)) {
        inlineBlocks.push(blocks[i - 1] as TextBlock);
        consumed.add(i - 1);
      }
      inlineBlocks.push(image);
      consumed.add(i);
      let j = i + 1;
      while (j < blocks.length) {
        const next = blocks[j];
        if (next.type === "text") {
          inlineBlocks.push(next);
          consumed.add(j);
          j++;
          continue;
        }
        if (next.type === "image" && next.wrap === "inline") {
          inlineBlocks.push(next);
          consumed.add(j);
          j++;
          continue;
        }
        break;
      }
      segments.push({ type: "inline-flow", blocks: inlineBlocks });
      continue;
    }

    segments.push({ type: "top-bottom", image });
    consumed.add(i);
  }

  return segments;
}

export function updateSquareFlowText(
  doc: NoteDocument,
  imageId: string,
  textBlocks: TextBlock[],
  newText: string,
): NoteDocument {
  const imageIndex = doc.blocks.findIndex((b) => b.id === imageId);
  if (imageIndex === -1) return doc;

  const idsToRemove = new Set(textBlocks.map((b) => b.id));
  const merged: TextBlock = {
    type: "text",
    id: textBlocks[0]?.id ?? newBlockId(),
    text: newText,
  };

  const blocks = doc.blocks.filter((b) => !idsToRemove.has(b.id));
  const insertAt = blocks.findIndex((b) => b.id === imageId) + 1;
  blocks.splice(insertAt, 0, merged);
  return { version: 1, blocks };
}

export function getMergedSquareText(textBlocks: TextBlock[]): string {
  return textBlocks.map((b) => b.text).join("");
}
