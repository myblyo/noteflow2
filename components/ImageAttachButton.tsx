import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { uploadToS3, type UploadFolder } from "../lib/s3Upload";
import { useThemeColors } from "../hooks/useTheme";
import { radius, spacing } from "../constants/theme";

type ImageAttachButtonProps = {
  label: string;
  folder: UploadFolder;
  onUploaded: (publicUrl: string) => void | Promise<void>;
  variant?: "primary" | "secondary";
};

export function ImageAttachButton({
  label,
  folder,
  onUploaded,
  variant = "secondary",
}: ImageAttachButtonProps) {
  const colors = useThemeColors();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (source: "library" | "camera") => {
    try {
      setUploading(true);
      const { pickImageFromLibrary, takePhotoWithCamera } = await import(
        "../lib/imagePicker"
      );
      const picked =
        source === "library"
          ? await pickImageFromLibrary()
          : await takePhotoWithCamera();
      if (!picked) return;

      const publicUrl = await uploadToS3(picked.uri, {
        folder,
        fileName: picked.fileName,
        contentType: picked.mimeType,
      });

      await onUploaded(publicUrl);
    } catch (error) {
      Alert.alert(
        "Error al subir",
        error instanceof Error ? error.message : "No se pudo subir la imagen",
      );
    } finally {
      setUploading(false);
    }
  };

  const showOptions = () => {
    if (Platform.OS === "web") {
      void handleUpload("library");
      return;
    }
    Alert.alert(label, "Elige una opción", [
      { text: "Galería", onPress: () => void handleUpload("library") },
      { text: "Cámara", onPress: () => void handleUpload("camera") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const isPrimary = variant === "primary";

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? colors.accent : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={showOptions}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.accent} />
      ) : (
        <>
          <Ionicons
            name="image-outline"
            size={18}
            color={isPrimary ? "#fff" : colors.accent}
          />
          <Text
            style={[
              styles.label,
              { color: isPrimary ? "#fff" : colors.textPrimary },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
