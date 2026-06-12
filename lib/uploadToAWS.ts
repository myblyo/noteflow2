/**
 * Subida directa desde React Native a la URL firmada de S3.
 * Ver diagrama: docs/flujo-subida-imagenes-s3.md
 */
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { uploadToS3, type UploadFolder } from "./s3Upload";

export { uploadToS3 };

type UploadOptions = {
  folder: UploadFolder;
  fileName: string;
  contentType: string;
};

/** Pasos 1–3: presigned URL + PUT a S3. Devuelve la URL pública en AWS. */
export async function uploadToAWS(
  localUri: string,
  options: UploadOptions,
): Promise<string> {
  return uploadToS3(localUri, options);
}

/** Pasos 1–4 para avatar: S3 + actualizar Firestore (`users/{uid}.avatarUrl`). */
export async function uploadAvatarToAWS(
  localUri: string,
  contentType = "image/jpeg",
  fileName = "avatar.jpg",
): Promise<string> {
  const publicUrl = await uploadToS3(localUri, {
    folder: "avatars",
    fileName,
    contentType,
  });

  const userId = auth().currentUser?.uid;
  if (!userId) {
    throw new Error("Debes iniciar sesión");
  }

  await firestore().collection("users").doc(userId).update({
    avatarUrl: publicUrl,
  });

  return publicUrl;
}
