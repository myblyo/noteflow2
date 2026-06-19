import React, {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../hooks/useTheme";
import { radius, spacing } from "../../constants/theme";
import type { ImageAlign, ImageBlock, ImageWrapMode, NoteDocument } from "../../types/noteDocument";
import {
  documentHasPendingUploads,
  documentIsEmpty,
  getSavedImageUrls,
  mergeAttachmentsIntoDocument,
  parseNoteContent,
  serializeNoteDocument,
} from "../../utils/noteDocument";
import { createImageBlockFromFile } from "../../utils/noteDocumentEdits";
import {
  applyImageDataset,
  beginFreeImageDrag,
  caretRangeFromPoint,
  createImageWidget,
  findImageSpan,
  finishFreeImageDrag,
  imageBlockFromSpan,
  injectEditorStyles,
  insertFilesAtPoint,
  insertNodeAtCaret,
  parseEditorToDocument,
  placeCaretAfter,
  removeImageFromEditor,
  setImageSelection,
  syncEditorFromDocument,
  updateFreeImageDragPosition,
  updateImageInEditor,
} from "../../utils/noteDocumentHtml";
import { flushDocumentUploads } from "../../lib/noteImageUpload";
import { deleteNoteAttachment } from "../../lib/api";
import type { NoteRichEditorRef } from "./types";

export type { NoteRichEditorRef };

type NoteRichEditorProps = {
  value: string;
  onChange: (content: string) => void;
  noteId?: string | null;
  placeholder?: string;
  minHeight?: number;
  fontSize?: number;
  lineHeight?: number;
  onAttachmentsChange?: (noteId: string, urls: string[]) => void;
  attachmentUrls?: string[];
  onBlur?: () => void;
};

const MIN_IMAGE_WIDTH = 80;
const MAX_IMAGE_WIDTH = 640;

export const NoteRichEditor = forwardRef<NoteRichEditorRef, NoteRichEditorProps>(
  function NoteRichEditor(
    {
      value,
      onChange,
      noteId,
      placeholder = "Escribe aquí…",
      minHeight = 280,
      fontSize = 17,
      lineHeight = 26,
      onAttachmentsChange,
      attachmentUrls = [],
      onBlur,
    },
    ref,
  ) {
    const colors = useThemeColors();
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const docRef = useRef<NoteDocument>(parseNoteContent(value));
    const blobsRef = useRef(new Map<string, Blob>());
    const editorRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const loadedKeyRef = useRef<string | null>(null);
    const isComposingRef = useRef(false);
    const resizeRef = useRef<{ id: string; startX: number; startWidth: number } | null>(null);
    const freeDragRef = useRef<{
      id: string;
      startX: number;
      startY: number;
      lastX: number;
      lastY: number;
      offsetX: number;
      offsetY: number;
      moved: boolean;
      begun: boolean;
      placeholder: HTMLSpanElement | null;
    } | null>(null);

    const emitFromEditor = useCallback(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const next = parseEditorToDocument(editor);
      docRef.current = next;
      const serialized = serializeNoteDocument(next);
      onChange(serialized);
      if (noteId) onAttachmentsChange?.(noteId, getSavedImageUrls(serialized));
    }, [noteId, onChange, onAttachmentsChange]);

    const syncDocumentToEditor = useCallback((doc: NoteDocument) => {
      const editor = editorRef.current;
      if (!editor) return;
      docRef.current = doc;
      syncEditorFromDocument(editor, doc);
      setImageSelection(editor, selectedImageId);
    }, [selectedImageId]);

    useEffect(() => {
      injectEditorStyles();
    }, []);

    useEffect(() => {
      const key = `${noteId ?? "new"}:${value}`;
      if (loadedKeyRef.current === key) return;
      if (editorRef.current === document.activeElement) return;
      loadedKeyRef.current = key;
      let parsed = parseNoteContent(value);
      if (attachmentUrls.length > 0) {
        parsed = mergeAttachmentsIntoDocument(serializeNoteDocument(parsed), attachmentUrls);
      }
      docRef.current = parsed;
      syncDocumentToEditor(parsed);
    }, [noteId, value, attachmentUrls, syncDocumentToEditor]);

    const uploadAndPatchImage = useCallback(
      async (block: ImageBlock, file?: Blob) => {
        if (!noteId) return block;
        try {
          const { uploadImageBlock } = await import("../../lib/noteImageUpload");
          const uploaded = await uploadImageBlock(block, noteId, file);
          const editor = editorRef.current;
          if (editor) updateImageInEditor(editor, uploaded);
          emitFromEditor();
          return uploaded;
        } catch (error) {
          const failed: ImageBlock = {
            ...block,
            status: "error",
            error: error instanceof Error ? error.message : "Error al subir",
          };
          const editor = editorRef.current;
          if (editor) updateImageInEditor(editor, failed);
          emitFromEditor();
          return failed;
        }
      },
      [emitFromEditor, noteId],
    );

    const addImagesFromFiles = useCallback(
      async (files: FileList | File[], clientX?: number, clientY?: number) => {
        const editor = editorRef.current;
        if (!editor) return;
        const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (list.length === 0) return;

        const widgets: HTMLSpanElement[] = [];
        for (const file of list) {
          const previewUrl = URL.createObjectURL(file);
          const block = createImageBlockFromFile(file, previewUrl);
          blobsRef.current.set(block.id, file);
          widgets.push(createImageWidget(block));
        }

        if (typeof clientX === "number" && typeof clientY === "number") {
          insertFilesAtPoint(editor, clientX, clientY, widgets);
        } else {
          for (const widget of widgets) insertNodeAtCaret(editor, widget);
        }

        emitFromEditor();

        if (noteId) {
          for (let i = 0; i < list.length; i++) {
            const file = list[i];
            const widget = widgets[i];
            const block = imageBlockFromSpan(widget);
            const uploading = { ...block, status: "uploading" as const };
            applyImageDataset(widget, uploading);
            const uploaded = await uploadAndPatchImage(block, file);
            URL.revokeObjectURL(block.url);
            blobsRef.current.delete(block.id);
            applyImageDataset(widget, uploaded);
          }
          emitFromEditor();
        }
      },
      [emitFromEditor, noteId, uploadAndPatchImage],
    );

    useImperativeHandle(
      ref,
      () => ({
        hasPendingUploads: () => documentHasPendingUploads(docRef.current),
        isEmpty: () => documentIsEmpty(docRef.current),
        flushPendingUploads: async (targetNoteId: string) => {
          const flushed = await flushDocumentUploads(
            docRef.current,
            targetNoteId,
            blobsRef.current,
          );
          blobsRef.current.clear();
          docRef.current = flushed;
          syncDocumentToEditor(flushed);
          const serialized = serializeNoteDocument(flushed);
          onChange(serialized);
          onAttachmentsChange?.(targetNoteId, getSavedImageUrls(serialized));
          return serialized;
        },
      }),
      [onChange, onAttachmentsChange, syncDocumentToEditor],
    );

    const patchSelectedImage = useCallback(
      (patch: Partial<ImageBlock>) => {
        if (!selectedImageId || !editorRef.current) return;
        const span = findImageSpan(editorRef.current, selectedImageId);
        if (!span) return;
        const current = imageBlockFromSpan(span);
        const next = { ...current, ...patch };
        applyImageDataset(span, next);
        emitFromEditor();
      },
      [emitFromEditor, selectedImageId],
    );

    const handleWrapChange = (wrap: ImageWrapMode) => {
      if (!selectedImageId || !editorRef.current) return;
      const patch: Partial<ImageBlock> = {
        wrap,
        x: undefined,
        y: undefined,
      };
      patchSelectedImage(patch);
      setImageSelection(editorRef.current, selectedImageId);
    };

    const handleAlignChange = (align: ImageAlign) => {
      if (!selectedImageId || !editorRef.current) return;
      const span = findImageSpan(editorRef.current, selectedImageId);
      if (!span) return;
      const block = imageBlockFromSpan(span);
      if (block.wrap === "free") return;
      patchSelectedImage({ align, wrap: "square" });
    };

    const handleRemoveImage = async () => {
      if (!selectedImageId || !editorRef.current) return;
      const span = findImageSpan(editorRef.current, selectedImageId);
      if (!span) return;
      const block = imageBlockFromSpan(span);
      if (block.attachmentId && noteId) {
        try {
          await deleteNoteAttachment(block.attachmentId);
        } catch {
          return;
        }
      }
      if (block.url.startsWith("blob:")) URL.revokeObjectURL(block.url);
      blobsRef.current.delete(block.id);
      removeImageFromEditor(editorRef.current, block.id);
      setSelectedImageId(null);
      emitFromEditor();
    };

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.querySelectorAll('[data-resize="true"]').forEach((el) => el.remove());
      if (!selectedImageId) return;
      const span = findImageSpan(editor, selectedImageId);
      if (!span) return;
      const isFree = span.classList.contains("nf-wrap-free");
      if (!isFree) span.style.position = "relative";
      const handle = document.createElement("span");
      handle.dataset.resize = "true";
      handle.contentEditable = "false";
      const handleSize = isFree ? 14 : 12;
      Object.assign(handle.style, {
        position: "absolute",
        right: "-5px",
        bottom: "-5px",
        width: `${handleSize}px`,
        height: `${handleSize}px`,
        background: "#6366f1",
        border: "2px solid #fff",
        borderRadius: "2px",
        cursor: "nwse-resize",
        pointerEvents: "auto",
        zIndex: "30",
      });
      span.appendChild(handle);
    }, [selectedImageId]);

    useEffect(() => {
      const onMouseMove = (event: MouseEvent) => {
        const editor = editorRef.current;
        if (!editor) return;

        if (resizeRef.current) {
          const delta = event.clientX - resizeRef.current.startX;
          const width = Math.max(
            MIN_IMAGE_WIDTH,
            Math.min(MAX_IMAGE_WIDTH, resizeRef.current.startWidth + delta),
          );
          const span = findImageSpan(editor, resizeRef.current.id);
          if (span) {
            span.dataset.width = String(width);
            const img = span.querySelector("img");
            if (img) img.style.width = `${width}px`;
          }
        }

        if (freeDragRef.current) {
          const span = findImageSpan(editor, freeDragRef.current.id);
          if (!span) return;

          freeDragRef.current.lastX = event.clientX;
          freeDragRef.current.lastY = event.clientY;

          if (!freeDragRef.current.begun) {
            const dx = Math.abs(event.clientX - freeDragRef.current.startX);
            const dy = Math.abs(event.clientY - freeDragRef.current.startY);
            if (dx > 3 || dy > 3) {
              const begun = beginFreeImageDrag(editor, span, event.clientX, event.clientY);
              freeDragRef.current.begun = true;
              freeDragRef.current.moved = true;
              freeDragRef.current.placeholder = begun.placeholder;
              freeDragRef.current.offsetX = begun.offsetX;
              freeDragRef.current.offsetY = begun.offsetY;
            }
            return;
          }

          updateFreeImageDragPosition(
            editor,
            span,
            event.clientX,
            event.clientY,
            freeDragRef.current.offsetX,
            freeDragRef.current.offsetY,
          );
        }
      };

      const onMouseUp = () => {
        const editor = editorRef.current;
        if (freeDragRef.current && editor) {
          const span = findImageSpan(editor, freeDragRef.current.id);
          if (span) {
            finishFreeImageDrag(
              editor,
              span,
              freeDragRef.current.placeholder,
              freeDragRef.current.lastX,
              freeDragRef.current.lastY,
              freeDragRef.current.moved && freeDragRef.current.begun,
            );
            if (freeDragRef.current.moved && freeDragRef.current.begun) {
              placeCaretAfter(span);
            }
          }
        }
        if (resizeRef.current || freeDragRef.current) emitFromEditor();
        resizeRef.current = null;
        freeDragRef.current = null;
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }, [emitFromEditor]);

    const handleEditorMouseDown = (event: MouseEvent) => {
      const editor = editorRef.current;
      if (!editor) return;
      const target = event.target as HTMLElement;
      const span = target.closest(`span.${"nf-image"}`) as HTMLSpanElement | null;
      if (!span) return;

      const block = imageBlockFromSpan(span);
      setSelectedImageId(block.id);
      setImageSelection(editor, block.id);

      const handle = target.dataset.resize === "true";
      if (handle) {
        event.preventDefault();
        resizeRef.current = {
          id: block.id,
          startX: event.clientX,
          startWidth: block.width,
        };
        return;
      }

      if (block.wrap === "free") {
        event.preventDefault();
        freeDragRef.current = {
          id: block.id,
          startX: event.clientX,
          startY: event.clientY,
          lastX: event.clientX,
          lastY: event.clientY,
          offsetX: 0,
          offsetY: 0,
          moved: false,
          begun: false,
          placeholder: null,
        };
      }
    };

    const handleEditorClick = (event: MouseEvent) => {
      const editor = editorRef.current;
      if (!editor) return;
      const span = (event.target as HTMLElement).closest(
        `span.${"nf-image"}`,
      ) as HTMLSpanElement | null;
      if (span) {
        event.stopPropagation();
        setSelectedImageId(span.dataset.id ?? null);
        setImageSelection(editor, span.dataset.id ?? null);
        return;
      }
      setSelectedImageId(null);
      setImageSelection(editor, null);
    };

    const selectedBlock =
      selectedImageId && editorRef.current
        ? (() => {
            const span = findImageSpan(editorRef.current!, selectedImageId);
            return span ? imageBlockFromSpan(span) : null;
          })()
        : null;

    return (
      <View style={styles.root}>
        {createElement("input", {
          ref: fileInputRef,
          type: "file",
          accept: "image/*",
          multiple: true,
          style: { display: "none" },
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files?.length) void addImagesFromFiles(files);
            event.target.value = "";
          },
        })}

        <View style={[styles.toolbar, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
          <Pressable
            style={[styles.toolbarBtn, { backgroundColor: colors.accent }]}
            onPress={() => fileInputRef.current?.click()}
          >
            <Ionicons name="image-outline" size={16} color="#fff" />
            <Text style={styles.toolbarBtnText}>Insertar imagen</Text>
          </Pressable>
          <Text style={[styles.toolbarHint, { color: colors.textTertiary }]}>
            El texto fluye alrededor de la imagen como en Google Docs
          </Text>
        </View>

        {selectedBlock ? (
          <View
            style={[
              styles.wrapToolbar,
              { backgroundColor: colors.surface, borderColor: colors.border, zIndex: 100 },
            ]}
          >
            {(["left", "center", "right"] as const).map((align) => {
              const isFree = selectedBlock.wrap === "free";
              const isActive = !isFree && selectedBlock.align === align;
              return (
                <Pressable
                  key={align}
                  disabled={isFree}
                  onPress={() => handleAlignChange(align)}
                  style={[
                    styles.alignBtn,
                    {
                      backgroundColor: isActive ? colors.accent : colors.surfaceSecondary,
                      opacity: isFree ? 0.35 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      align === "left"
                        ? "arrow-back-outline"
                        : align === "center"
                          ? "ellipsis-horizontal"
                          : "arrow-forward-outline"
                    }
                    size={14}
                    color={isActive ? "#fff" : colors.textSecondary}
                  />
                </Pressable>
              );
            })}

            <Pressable
              onPress={() =>
                handleWrapChange(selectedBlock.wrap === "free" ? "square" : "free")
              }
              style={[
                styles.freeBtn,
                {
                  backgroundColor:
                    selectedBlock.wrap === "free" ? colors.accent : colors.surfaceSecondary,
                },
              ]}
            >
              <Ionicons
                name="move-outline"
                size={14}
                color={selectedBlock.wrap === "free" ? "#fff" : colors.textSecondary}
              />
              <Text
                style={{
                  color: selectedBlock.wrap === "free" ? "#fff" : colors.textSecondary,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                Posición libre
              </Text>
            </Pressable>

            <Pressable
              onPress={() => void handleRemoveImage()}
              style={[styles.alignBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Ionicons name="trash-outline" size={14} color={colors.error} />
            </Pressable>
          </View>
        ) : null}

        {createElement("div", {
          ref: (node: HTMLDivElement | null) => {
            editorRef.current = node;
            if (node && !node.innerHTML && docRef.current.blocks.length > 0) {
              syncEditorFromDocument(node, docRef.current);
            }
          },
          className: "nf-doc-editor",
          contentEditable: true,
          suppressContentEditableWarning: true,
          "data-placeholder": placeholder,
          onInput: () => {
            if (isComposingRef.current) return;
            emitFromEditor();
          },
          onCompositionStart: () => {
            isComposingRef.current = true;
          },
          onCompositionEnd: () => {
            isComposingRef.current = false;
            emitFromEditor();
          },
          onBlur: () => {
            emitFromEditor();
            onBlur?.();
          },
          onClick: handleEditorClick,
          onMouseDown: handleEditorMouseDown,
          onDragOver: (e: DragEvent) => {
            e.preventDefault();
          },
          onDrop: (e: DragEvent) => {
            e.preventDefault();
            const files = e.dataTransfer?.files;
            if (files?.length) {
              void addImagesFromFiles(files, e.clientX, e.clientY);
              return;
            }
            const blockId = e.dataTransfer?.getData("application/x-noteflow-block");
            if (!blockId || !editorRef.current) return;
            const span = findImageSpan(editorRef.current, blockId);
            if (!span) return;
            const range = caretRangeFromPoint(e.clientX, e.clientY);
            if (range) {
              range.insertNode(span);
              placeCaretAfter(span);
              emitFromEditor();
            }
          },
          style: {
            width: "100%",
            flex: 1,
            minHeight,
            borderWidth: 0,
            borderStyle: "none",
            borderRadius: 0,
            padding: 0,
            backgroundColor: "transparent",
            color: colors.textPrimary,
            fontSize,
            lineHeight: `${lineHeight}px`,
            boxSizing: "border-box",
            overflow: "visible",
            outline: "none",
          },
        })}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: { width: "100%" },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  toolbarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  toolbarBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  toolbarHint: { fontSize: 12, flex: 1, minWidth: 180 },
  wrapToolbar: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 6,
    padding: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    alignItems: "center",
    elevation: 8,
  },
  alignBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  freeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 6,
    marginLeft: spacing.xs,
  },
});
