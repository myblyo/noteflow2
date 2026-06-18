import React, {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RemoteImage } from "./RemoteImage";
import {
  addNoteAttachment,
  deleteNoteAttachment,
  getNoteAttachments,
  type ApiNoteAttachment,
} from "../lib/api";
import {
  filesToPickedImages,
  pickImageFromLibrary,
  takePhotoWithCamera,
  type PickedImage,
} from "../lib/imagePicker";
import { uploadBlobToS3, uploadToS3 } from "../lib/s3Upload";
import { useThemeColors } from "../hooks/useTheme";
import { radius, spacing } from "../constants/theme";

type AttachmentStatus = "preview" | "uploading" | "saved" | "error";

type LocalAttachment = {
  key: string;
  previewUri: string;
  publicUrl?: string;
  attachmentId?: string;
  fileName: string;
  mimeType: string;
  blob?: Blob;
  status: AttachmentStatus;
  error?: string;
};

export type NoteAttachmentSectionRef = {
  flushPendingUploads: (noteId: string) => Promise<void>;
  hasPendingUploads: () => boolean;
};

type NoteAttachmentSectionProps = {
  noteId?: string | null;
  style?: ViewStyle;
  onAttachmentsChange?: (noteId: string, urls: string[]) => void;
};

function newKey() {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const NoteAttachmentSection = forwardRef<
  NoteAttachmentSectionRef,
  NoteAttachmentSectionProps
>(function NoteAttachmentSection({ noteId, style, onAttachmentsChange }, ref) {
  const colors = useThemeColors();
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const attachmentsRef = useRef<LocalAttachment[]>([]);
  attachmentsRef.current = attachments;
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(Boolean(noteId));
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const notifyChange = useCallback(
    (items: LocalAttachment[], targetNoteId?: string | null) => {
      const id = targetNoteId ?? noteId;
      if (!id) return;
      const urls = items
        .filter((item) => item.status === "saved" && item.publicUrl)
        .map((item) => item.publicUrl!);
      onAttachmentsChange?.(id, urls);
    },
    [noteId, onAttachmentsChange],
  );
  const notifyChangeRef = useRef(notifyChange);
  notifyChangeRef.current = notifyChange;

  const mapSaved = useCallback((rows: ApiNoteAttachment[]): LocalAttachment[] => {
    return rows.map((row) => ({
      key: row.id,
      previewUri: row.url,
      publicUrl: row.url,
      attachmentId: row.id,
      fileName: row.url.split("/").pop() ?? "image",
      mimeType: "image/jpeg",
      status: "saved" as const,
    }));
  }, []);

  useEffect(() => {
    if (!noteId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getNoteAttachments(noteId)
      .then((rows) => {
        if (cancelled) return;
        const mapped = mapSaved(rows);
        setAttachments(mapped);
        notifyChangeRef.current(mapped, noteId);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[NoteAttachmentSection] load failed", error);
        Alert.alert(
          "No se pudieron cargar las imágenes",
          error instanceof Error ? error.message : "Error desconocido",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [noteId, mapSaved]);

  const uploadOne = useCallback(
    async (item: LocalAttachment, targetNoteId: string): Promise<LocalAttachment> => {
      setAttachments((prev) =>
        prev.map((entry) =>
          entry.key === item.key ? { ...entry, status: "uploading", error: undefined } : entry,
        ),
      );

      try {
        const publicUrl = item.blob
          ? await uploadBlobToS3(item.blob, {
              folder: "notes",
              fileName: item.fileName,
              contentType: item.mimeType,
            })
          : await uploadToS3(item.previewUri, {
              folder: "notes",
              fileName: item.fileName,
              contentType: item.mimeType,
            });

        const saved = await addNoteAttachment(targetNoteId, publicUrl);
        return {
          ...item,
          previewUri: publicUrl,
          publicUrl,
          attachmentId: saved.id,
          status: "saved",
          blob: undefined,
        };
      } catch (error) {
        return {
          ...item,
          status: "error",
          error: error instanceof Error ? error.message : "Error al subir",
        };
      }
    },
    [],
  );

  const addPickedImages = useCallback(
    async (picked: PickedImage[]) => {
      if (picked.length === 0) return;

      const newItems: LocalAttachment[] = picked.map((image) => ({
        key: newKey(),
        previewUri: image.uri,
        fileName: image.fileName,
        mimeType: image.mimeType,
        blob: image.blob,
        status: noteId ? "uploading" : "preview",
      }));

      setAttachments((prev) => {
        const next = [...prev, ...newItems];
        notifyChange(next, noteId);
        return next;
      });

      if (!noteId) return;

      for (const item of newItems) {
        const result = await uploadOne(item, noteId);
        setAttachments((prev) => {
          const next = prev.map((entry) => (entry.key === item.key ? result : entry));
          notifyChange(next, noteId);
          return next;
        });
        if (result.status === "error") {
          Alert.alert("Error al subir", result.error ?? "No se pudo subir la imagen");
        }
      }
    },
    [noteId, notifyChange, uploadOne],
  );

  useImperativeHandle(ref, () => ({
    hasPendingUploads: () =>
      attachmentsRef.current.some(
        (item) => item.status === "preview" || item.status === "uploading",
      ),
    flushPendingUploads: async (targetNoteId: string) => {
      const pending = attachmentsRef.current.filter(
        (item) => item.status === "preview" || item.status === "error",
      );
      for (const item of pending) {
        const result = await uploadOne(item, targetNoteId);
        setAttachments((prev) => {
          const next = prev.map((entry) => (entry.key === item.key ? result : entry));
          notifyChange(next, targetNoteId);
          return next;
        });
        if (result.status === "error") {
          throw new Error(result.error ?? "No se pudo subir una imagen");
        }
      }
    },
  }), [notifyChange, uploadOne]);

  const handlePickLibrary = async () => {
    const picked = await pickImageFromLibrary();
    if (picked) await addPickedImages([picked]);
  };

  const handlePickCamera = async () => {
    const picked = await takePhotoWithCamera();
    if (picked) await addPickedImages([picked]);
  };

  const handleBrowseFiles = () => {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
      return;
    }
    void handlePickLibrary();
  };

  const handleWebFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    void addPickedImages(filesToPickedImages(files));
    event.target.value = "";
  };

  const handleRemove = async (item: LocalAttachment) => {
    if (item.status === "uploading") return;

    if (item.attachmentId && noteId) {
      try {
        await deleteNoteAttachment(item.attachmentId);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "No se pudo eliminar la imagen",
        );
        return;
      }
    }

    if (item.previewUri.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUri);
    }

    setAttachments((prev) => {
      const next = prev.filter((entry) => entry.key !== item.key);
      notifyChange(next, noteId);
      return next;
    });
  };

  const handleRetry = async (item: LocalAttachment) => {
    if (!noteId) return;
    const result = await uploadOne(item, noteId);
    setAttachments((prev) => {
      const next = prev.map((entry) => (entry.key === item.key ? result : entry));
      notifyChange(next, noteId);
      return next;
    });
  };

  const webDropHandlers =
    Platform.OS === "web"
      ? ({
          onDragOver: (event: DragEvent) => {
            event.preventDefault();
            setDragOver(true);
          },
          onDragLeave: () => setDragOver(false),
          onDrop: (event: DragEvent) => {
            event.preventDefault();
            setDragOver(false);
            const files = event.dataTransfer?.files;
            if (files?.length) void addPickedImages(filesToPickedImages(files));
          },
        } as object)
      : {};

  const showOptions = () => {
    if (Platform.OS === "web") {
      handleBrowseFiles();
      return;
    }
    Alert.alert("Añadir imagen", "Elige una opción", [
      { text: "Explorar archivos", onPress: () => void handlePickLibrary() },
      { text: "Cámara", onPress: () => void handlePickCamera() },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.root, style]}>
      {Platform.OS === "web"
        ? createElement("input", {
            ref: fileInputRef,
            type: "file",
            accept: "image/*",
            multiple: true,
            style: { display: "none" },
            onChange: handleWebFileChange,
          })
        : null}

      <View
        {...webDropHandlers}
        style={[
          styles.dropZone,
          {
            borderColor: dragOver ? colors.accent : colors.border,
            backgroundColor: dragOver ? colors.accentLight : colors.surface,
          },
        ]}
      >
        <Ionicons name="cloud-upload-outline" size={28} color={colors.accent} />
        <Text style={[styles.dropTitle, { color: colors.textPrimary }]}>
          {Platform.OS === "web"
            ? "Arrastra imágenes aquí o elige un archivo"
            : "Añade imágenes a tu nota"}
        </Text>
        <Text style={[styles.dropHint, { color: colors.textSecondary }]}>
          {noteId
            ? "Se subirán y guardarán al adjuntarlas"
            : "Vista previa aquí; se guardarán al crear la nota"}
        </Text>
        <Pressable
          style={[styles.pickButton, { backgroundColor: colors.accent }]}
          onPress={showOptions}
        >
          <Ionicons name="image-outline" size={18} color="#fff" />
          <Text style={styles.pickButtonText}>Seleccionar imagen</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: colors.textSecondary, marginLeft: spacing.sm }}>
            Cargando imágenes…
          </Text>
        </View>
      ) : null}

      {attachments.length > 0 ? (
        <View
          style={[
            styles.gallery,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceSecondary,
            },
          ]}
        >
          <Text style={[styles.galleryTitle, { color: colors.textSecondary }]}>
            Imágenes en la nota ({attachments.length})
          </Text>
          <View style={styles.galleryGrid}>
            {attachments.map((item) => (
              <View key={item.key} style={styles.thumbWrap}>
                <RemoteImage
                  uri={item.previewUri}
                  style={[styles.thumb, { borderColor: colors.border }]}
                  contentFit="cover"
                  recyclingKey={item.key}
                />
                {item.status === "uploading" || item.status === "preview" ? (
                  <View style={[styles.thumbOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
                    <ActivityIndicator color="#fff" />
                    {item.status === "preview" ? (
                      <Text style={styles.overlayText}>Vista previa</Text>
                    ) : null}
                  </View>
                ) : null}
                {item.status === "error" ? (
                  <Pressable
                    style={[styles.thumbOverlay, { backgroundColor: "rgba(0,0,0,0.55)" }]}
                    onPress={() => void handleRetry(item)}
                  >
                    <Ionicons name="refresh" size={22} color="#fff" />
                    <Text style={styles.overlayText}>Reintentar</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={[styles.removeBtn, { backgroundColor: colors.error }]}
                  onPress={() => void handleRemove(item)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    width: "100%",
    marginTop: spacing.lg,
  },
  dropZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  dropTitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  dropHint: {
    fontSize: 13,
    textAlign: "center",
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  pickButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  gallery: {
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  galleryTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  thumbWrap: {
    position: "relative",
    width: 120,
    height: 120,
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  overlayText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
