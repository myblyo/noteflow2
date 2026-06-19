import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useThemeColors } from "../../hooks/useTheme";
import { spacing } from "../../constants/theme";
import {
  NoteAttachmentSection,
  type NoteAttachmentSectionRef,
} from "../NoteAttachmentSection";
import { RemoteImage } from "../RemoteImage";
import type { ImageBlock } from "../../types/noteDocument";
import {
  documentHasPendingUploads,
  documentIsEmpty,
  getImageBlocksFromContent,
  getPlainTextFromContent,
  getSavedImageUrls,
  mergeAttachmentsIntoDocument,
  parseNoteContent,
  serializeNoteDocument,
} from "../../utils/noteDocument";
import { newBlockId } from "../../utils/noteDocument";
import { flushDocumentUploads } from "../../lib/noteImageUpload";
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
  onAutoPersist?: (content: string) => void;
  attachmentUrls?: string[];
  onBlur?: () => void;
};

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
    const [plainText, setPlainText] = useState(() => getPlainTextFromContent(value));
    const attachmentRef = useRef<NoteAttachmentSectionRef>(null);
    const blobsRef = useRef(new Map<string, Blob>());
    const loadedKeyRef = useRef<string | null>(null);
    const images = getImageBlocksFromContent(value);

    useEffect(() => {
      const key = `${noteId ?? "new"}:${value}`;
      if (loadedKeyRef.current === key) return;
      loadedKeyRef.current = key;
      setPlainText(getPlainTextFromContent(value));
    }, [noteId, value]);

    const rebuildContent = (text: string, imageBlocks: ImageBlock[]) => {
      const blocks = [
        { type: "text" as const, id: newBlockId(), text },
        ...imageBlocks,
      ];
      return serializeNoteDocument({ version: 1, blocks });
    };

    const handleTextChange = (text: string) => {
      setPlainText(text);
      const doc = parseNoteContent(value);
      const imageBlocks = doc.blocks.filter(
        (block): block is ImageBlock => block.type === "image",
      );
      const serialized = rebuildContent(text, imageBlocks);
      onChange(serialized);
    };

    useImperativeHandle(
      ref,
      () => ({
        hasPendingUploads: () =>
          documentHasPendingUploads(parseNoteContent(value)) ||
          (attachmentRef.current?.hasPendingUploads() ?? false),
        isEmpty: () =>
          documentIsEmpty(parseNoteContent(value)) &&
          !(attachmentRef.current?.hasPendingUploads() ?? false),
        flushPendingUploads: async (targetNoteId: string) => {
          let doc = parseNoteContent(value);
          if (attachmentUrls.length > 0) {
            doc = mergeAttachmentsIntoDocument(serializeNoteDocument(doc), attachmentUrls);
          }
          if (documentHasPendingUploads(doc)) {
            doc = await flushDocumentUploads(doc, targetNoteId, blobsRef.current);
          }
          if (attachmentRef.current?.hasPendingUploads()) {
            await attachmentRef.current.flushPendingUploads(targetNoteId);
          }
          const serialized = serializeNoteDocument(doc);
          onChange(serialized);
          onAttachmentsChange?.(targetNoteId, getSavedImageUrls(serialized));
          return serialized;
        },
      }),
      [attachmentUrls, onAttachmentsChange, onChange, value],
    );

    return (
      <View style={styles.root}>
        <Text style={[styles.nativeHint, { color: colors.textTertiary }]}>
          En móvil, las imágenes se muestran debajo del texto. En web puedes insertarlas en línea.
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              minHeight,
              fontSize,
              lineHeight,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={plainText}
          onChangeText={handleTextChange}
          onBlur={onBlur}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
        />

        {images.length > 0 ? (
          <View style={styles.inlinePreview}>
            {images.map((image) => (
              <RemoteImage
                key={image.id}
                uri={image.url}
                style={[styles.previewImage, { borderColor: colors.border }]}
                contentFit="cover"
              />
            ))}
          </View>
        ) : null}

        <NoteAttachmentSection
          ref={attachmentRef}
          noteId={noteId}
          style={{ marginTop: spacing.md }}
          onAttachmentsChange={(id, urls) => {
            const merged = mergeAttachmentsIntoDocument(value, urls);
            onChange(serializeNoteDocument(merged));
            onAttachmentsChange?.(id, urls);
          }}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  nativeHint: {
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  input: {
    width: "100%",
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as never,
  },
  inlinePreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  previewImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
