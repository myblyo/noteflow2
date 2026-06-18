import { Alert, Platform } from "react-native";

export type PickedImage = {
  uri: string;
  mimeType: string;
  fileName: string;
  blob?: Blob;
};

type ImagePickerModule = typeof import("expo-image-picker");

async function loadImagePicker(): Promise<ImagePickerModule | null> {
  try {
    return await import("expo-image-picker");
  } catch {
    Alert.alert(
      "Fotos no disponibles",
      "Hay que recompilar la app Android para incluir el selector de imágenes.\n\nEn el PC ejecuta: npm run android:win",
    );
    return null;
  }
}

function fileNameFromUri(uri: string, mimeType: string): string {
  const ext = mimeType.split("/")[1] ?? "jpg";
  const base = uri.split("/").pop()?.split("?")[0];
  if (base && base.includes(".")) return base;
  return `image-${Date.now()}.${ext}`;
}

export async function pickImageFromLibrary(): Promise<PickedImage | null> {
  const ImagePicker = await loadImagePicker();
  if (!ImagePicker) return null;

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería para elegir una imagen.");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: Platform.OS !== "web",
    aspect: Platform.OS !== "web" ? [1, 1] : undefined,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "image/jpeg";
  return {
    uri: asset.uri,
    mimeType,
    fileName: asset.fileName ?? fileNameFromUri(asset.uri, mimeType),
  };
}

export async function takePhotoWithCamera(): Promise<PickedImage | null> {
  if (Platform.OS === "web") {
    Alert.alert("No disponible", "La cámara no está disponible en web.");
    return null;
  }

  const ImagePicker = await loadImagePicker();
  if (!ImagePicker) return null;

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permiso necesario", "Necesitamos acceso a la cámara para tomar una foto.");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "image/jpeg";
  return {
    uri: asset.uri,
    mimeType,
    fileName: asset.fileName ?? fileNameFromUri(asset.uri, mimeType),
  };
}

/** Web: convierte FileList del explorador o drag & drop en PickedImage[]. */
export function filesToPickedImages(files: FileList | File[]): PickedImage[] {
  return Array.from(files)
    .filter((file) => file.type.startsWith("image/"))
    .map((file) => ({
      uri: URL.createObjectURL(file),
      mimeType: file.type || "image/jpeg",
      fileName: file.name || `image-${Date.now()}.jpg`,
      blob: file,
    }));
}
