import type {
  ImageAlign,
  ImageBlock,
  ImageWrapMode,
  NoteBlock,
  NoteDocument,
} from "../types/noteDocument";
import { emptyDocument, newBlockId } from "./noteDocument";

const IMAGE_CLASS = "nf-image";
const DRAG_PLACEHOLDER_CLASS = "nf-drag-placeholder";

export function injectEditorStyles() {
  if (typeof document === "undefined") return;
  const id = "nf-gdocs-editor-styles";
  const css = `
    .nf-doc-editor {
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      outline: none;
      position: relative;
      display: flow-root;
      background: transparent;
    }
    .nf-doc-editor:focus {
      outline: none;
    }
    .nf-doc-editor:empty::before {
      content: attr(data-placeholder);
      color: #9ca3af;
      pointer-events: none;
    }
    .nf-doc-editor .nf-image {
      line-height: 0;
      user-select: none;
      max-width: 100%;
      position: relative;
      box-sizing: content-box;
    }
    .nf-doc-editor .nf-image img {
      height: auto;
      border-radius: 4px;
      display: block;
      pointer-events: none;
      box-sizing: border-box;
    }
    .nf-doc-editor .nf-image.nf-wrap-square.nf-align-left,
    .nf-doc-editor .nf-image.nf-wrap-free.nf-align-left,
    .nf-doc-editor .nf-drag-placeholder.nf-align-left {
      float: left;
      clear: none;
      padding: 0;
      margin: 2px 10px 4px 0;
      shape-outside: margin-box;
    }
    .nf-doc-editor .nf-image.nf-wrap-square.nf-align-right,
    .nf-doc-editor .nf-image.nf-wrap-free.nf-align-right,
    .nf-doc-editor .nf-drag-placeholder.nf-align-right {
      float: right;
      clear: none;
      padding: 0;
      margin: 2px 0 4px 10px;
      shape-outside: margin-box;
    }
    .nf-doc-editor .nf-image.nf-wrap-square.nf-align-center,
    .nf-doc-editor .nf-image.nf-wrap-free.nf-align-center,
    .nf-doc-editor .nf-drag-placeholder.nf-align-center {
      float: left;
      width: 100%;
      clear: both;
      padding: 0;
      margin: 6px 0 8px;
      text-align: center;
      shape-outside: none;
    }
    .nf-doc-editor .nf-image.nf-align-center img,
    .nf-doc-editor .nf-drag-placeholder.nf-align-center .nf-drag-placeholder-core {
      display: inline-block;
      vertical-align: top;
    }
    .nf-doc-editor .nf-image.nf-wrap-inline {
      display: inline-block;
      vertical-align: text-bottom;
      margin: 0 4px;
      padding: 0;
      float: none;
      width: auto;
      clear: none;
      text-align: left;
      shape-outside: none;
      shape-margin: 0;
    }
    .nf-doc-editor .nf-image.nf-wrap-topBottom {
      display: block;
      clear: both;
      float: none;
      width: auto;
      margin: 16px auto;
      padding: 8px 0;
      text-align: center;
      shape-outside: none;
    }
    .nf-doc-editor .nf-image.nf-selected {
      outline: 2px solid #6366f1;
      outline-offset: 1px;
    }
    .nf-doc-editor .nf-image.nf-wrap-free.nf-selected {
      cursor: grab;
    }
    .nf-doc-editor .nf-image.nf-wrap-free.nf-dragging {
      cursor: grabbing;
      z-index: 20;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.18);
      pointer-events: none;
      shape-outside: none;
      margin: 0;
      padding: 0;
    }
    .nf-doc-editor .nf-drag-placeholder {
      visibility: hidden;
      pointer-events: none;
      line-height: 0;
      box-sizing: content-box;
    }
    .nf-doc-editor .nf-drag-placeholder .nf-drag-placeholder-core {
      display: inline-block;
      vertical-align: top;
      line-height: 0;
    }
  `;
  const existing = document.getElementById(id);
  if (existing) {
    existing.textContent = css;
    return;
  }
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

function wrapClass(wrap: ImageWrapMode) {
  return `nf-wrap-${wrap}`;
}

function alignClass(align: ImageAlign) {
  return `nf-align-${align}`;
}

export function createImageWidget(block: ImageBlock): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = `${IMAGE_CLASS} ${wrapClass(block.wrap)} ${alignClass(block.align)}`;
  span.contentEditable = "false";
  span.style.position = "relative";
  applyImageDataset(span, block);

  const img = document.createElement("img");
  img.src = block.url;
  img.alt = block.fileName ?? "Imagen";
  img.draggable = false;
  img.style.width = `${block.width}px`;
  img.style.maxWidth = "100%";
  span.appendChild(img);
  return span;
}

export function applyImageDataset(span: HTMLSpanElement, block: ImageBlock) {
  span.dataset.id = block.id;
  span.dataset.url = block.url;
  span.dataset.width = String(block.width);
  span.dataset.wrap = block.wrap;
  span.dataset.align = block.align;
  span.dataset.status = block.status;
  if (block.attachmentId) span.dataset.attachmentId = block.attachmentId;
  else delete span.dataset.attachmentId;
  if (block.fileName) span.dataset.fileName = block.fileName;
  if (block.mimeType) span.dataset.mimeType = block.mimeType;
  if (block.error) span.dataset.error = block.error;
  else delete span.dataset.error;

  span.className = `${IMAGE_CLASS} ${wrapClass(block.wrap)} ${alignClass(block.align)}`;

  span.style.float = "";
  span.style.margin = "";
  span.style.padding = "";
  span.style.width = "";
  span.style.clear = "";
  span.style.textAlign = "";
  span.style.zIndex = "";
  span.style.cursor = "";
  span.style.boxShadow = "";
  span.style.transform = "";
  span.style.transition = "";
  span.style.position = "relative";
  span.style.left = "";
  span.style.top = "";
  span.classList.remove("nf-dragging");

  const img = span.querySelector("img");
  if (img) img.style.width = `${block.width}px`;
}

export function imageBlockFromSpan(span: HTMLSpanElement): ImageBlock {
  const width = Number(span.dataset.width) || 280;
  const wrap = (span.dataset.wrap as ImageWrapMode) ?? "square";
  return {
    type: "image",
    id: span.dataset.id ?? newBlockId(),
    url: span.dataset.url ?? "",
    attachmentId: span.dataset.attachmentId,
    fileName: span.dataset.fileName,
    mimeType: span.dataset.mimeType,
    width,
    wrap,
    align: (span.dataset.align as ImageAlign) ?? "left",
    status:
      (span.dataset.status as ImageBlock["status"]) ?? "saved",
    error: span.dataset.error,
  };
}

export function parseEditorToDocument(root: HTMLElement): NoteDocument {
  const blocks: NoteBlock[] = [];
  let textAcc = "";

  const flushText = () => {
    if (!textAcc) return;
    blocks.push({ type: "text", id: newBlockId(), text: textAcc });
    textAcc = "";
  };

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      textAcc += node.textContent ?? "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;

    if (el.classList.contains(DRAG_PLACEHOLDER_CLASS)) return;

    if (el.classList.contains(IMAGE_CLASS)) {
      flushText();
      blocks.push(imageBlockFromSpan(el as HTMLSpanElement));
      return;
    }

    if (el.tagName === "BR") {
      textAcc += "\n";
      return;
    }

    if (el.tagName === "DIV" || el.tagName === "P") {
      if (el !== root) {
        for (const child of Array.from(el.childNodes)) visit(child);
        if (el.nextSibling) textAcc += "\n";
        return;
      }
    }

    for (const child of Array.from(el.childNodes)) visit(child);
  };

  for (const child of Array.from(root.childNodes)) visit(child);
  flushText();

  if (blocks.length === 0) return emptyDocument();
  return { version: 1, blocks };
}

export function syncEditorFromDocument(root: HTMLElement, doc: NoteDocument) {
  root.innerHTML = "";
  for (const block of doc.blocks) {
    if (block.type === "text") {
      if (!block.text) continue;
      const lines = block.text.split("\n");
      lines.forEach((line, index) => {
        if (line) root.appendChild(document.createTextNode(line));
        if (index < lines.length - 1) root.appendChild(document.createElement("br"));
      });
      continue;
    }
    root.appendChild(createImageWidget(block));
  }
}

export function insertNodeAtCaret(editor: HTMLElement, node: Node) {
  editor.focus();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    editor.appendChild(node);
    placeCaretAfter(node);
    return;
  }
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) {
    editor.appendChild(node);
    placeCaretAfter(node);
    return;
  }
  range.deleteContents();
  range.insertNode(node);
  placeCaretAfter(node);
}

export function placeCaretAfter(node: Node) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function caretRangeFromPoint(x: number, y: number): Range | null {
  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
  };
  if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(x, y);
  const pos = doc.caretPositionFromPoint?.(x, y);
  if (!pos) return null;
  const range = document.createRange();
  range.setStart(pos.offsetNode, pos.offset);
  range.collapse(true);
  return range;
}

export function insertFilesAtPoint(
  editor: HTMLElement,
  clientX: number,
  clientY: number,
  nodes: Node[],
) {
  const range = caretRangeFromPoint(clientX, clientY);
  const sel = window.getSelection();
  if (range && sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
  for (const node of nodes) insertNodeAtCaret(editor, node);
}

export function findImageSpan(editor: HTMLElement, id: string): HTMLSpanElement | null {
  return editor.querySelector(`span.${IMAGE_CLASS}[data-id="${id}"]`);
}

export function setImageSelection(editor: HTMLElement, selectedId: string | null) {
  editor.querySelectorAll(`span.${IMAGE_CLASS}`).forEach((el) => {
    el.classList.toggle("nf-selected", (el as HTMLElement).dataset.id === selectedId);
  });
}

export function updateImageInEditor(editor: HTMLElement, block: ImageBlock) {
  const span = findImageSpan(editor, block.id);
  if (span) applyImageDataset(span, block);
}

export function removeImageFromEditor(editor: HTMLElement, id: string) {
  findImageSpan(editor, id)?.remove();
}

export function relocateImageAtPoint(
  editor: HTMLElement,
  span: HTMLSpanElement,
  clientX: number,
  clientY: number,
): boolean {
  const parent = span.parentNode;
  if (!parent) return false;

  span.remove();
  const range = caretRangeFromPoint(clientX, clientY);
  if (
    range &&
    editor.contains(range.commonAncestorContainer) &&
    !span.contains(range.commonAncestorContainer)
  ) {
    range.insertNode(span);
    return true;
  }

  editor.appendChild(span);
  return true;
}

function measureImageContentSize(span: HTMLSpanElement, width: number): number {
  const img = span.querySelector("img");
  if (!img) return 48;
  const naturalH = img.naturalHeight;
  const naturalW = img.naturalWidth;
  if (naturalH > 0 && naturalW > 0) {
    return Math.ceil((width / naturalW) * naturalH);
  }
  return Math.max(span.offsetHeight, Math.ceil(width * 0.65));
}

function createFreeDragPlaceholder(span: HTMLSpanElement): HTMLSpanElement {
  const block = imageBlockFromSpan(span);
  const placeholder = document.createElement("span");
  placeholder.className = `${DRAG_PLACEHOLDER_CLASS} ${wrapClass(block.wrap)} ${alignClass(block.align)}`;
  placeholder.contentEditable = "false";
  placeholder.dataset.placeholder = "true";

  const core = document.createElement("span");
  core.className = "nf-drag-placeholder-core";
  const height = measureImageContentSize(span, block.width);
  core.style.width = `${block.width}px`;
  core.style.height = `${height}px`;
  placeholder.appendChild(core);
  return placeholder;
}

export function beginFreeImageDrag(
  editor: HTMLElement,
  span: HTMLSpanElement,
  clientX: number,
  clientY: number,
): { placeholder: HTMLSpanElement; offsetX: number; offsetY: number } {
  const rect = span.getBoundingClientRect();
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;
  const placeholder = createFreeDragPlaceholder(span);
  span.parentNode?.insertBefore(placeholder, span);

  span.classList.add("nf-dragging");
  span.style.position = "absolute";
  span.style.float = "none";
  span.style.margin = "0";
  span.style.width = "";
  span.style.clear = "";
  span.style.textAlign = "";
  span.style.zIndex = "20";
  span.style.transition = "none";

  updateFreeImageDragPosition(editor, span, clientX, clientY, offsetX, offsetY);
  return { placeholder, offsetX, offsetY };
}

export function updateFreeImageDragPosition(
  editor: HTMLElement,
  span: HTMLSpanElement,
  clientX: number,
  clientY: number,
  offsetX: number,
  offsetY: number,
) {
  const editorRect = editor.getBoundingClientRect();
  const block = imageBlockFromSpan(span);
  const width = block.width;
  const height = Math.max(span.offsetHeight, 48);
  const padding = 4;
  const maxX = Math.max(padding, editor.clientWidth - width - padding);
  const maxY = Math.max(padding, editor.scrollHeight - height - padding);
  const x = Math.min(
    maxX,
    Math.max(padding, clientX - editorRect.left - offsetX + editor.scrollLeft),
  );
  const y = Math.min(
    maxY,
    Math.max(padding, clientY - editorRect.top - offsetY + editor.scrollTop),
  );
  span.style.position = "absolute";
  span.style.left = `${x}px`;
  span.style.top = `${y}px`;
  span.style.float = "none";
  span.style.margin = "0";
  span.style.zIndex = "20";
}

export function inferAlignFromDrop(
  editor: HTMLElement,
  clientX: number,
  imageWidth: number,
): ImageAlign {
  const editorRect = editor.getBoundingClientRect();
  const imageCenter = clientX - imageWidth / 2;
  const relCenter = (imageCenter - editorRect.left) / Math.max(editor.clientWidth, 1);
  if (relCenter < 0.32) return "left";
  if (relCenter > 0.68) return "right";
  return "center";
}

export function finishFreeImageDrag(
  editor: HTMLElement,
  span: HTMLSpanElement,
  placeholder: HTMLSpanElement | null,
  clientX: number,
  clientY: number,
  moved: boolean,
) {
  placeholder?.remove();
  span.classList.remove("nf-dragging");

  if (moved) {
    const block = imageBlockFromSpan(span);
    block.wrap = "free";
    block.align = inferAlignFromDrop(editor, clientX, block.width);
    relocateImageAtPoint(editor, span, clientX, clientY);
    applyImageDataset(span, block);
    return;
  }

  applyImageDataset(span, imageBlockFromSpan(span));
}
