/**
 * Flujo seguro de subida a S3:
 * 1. App pide Presigned URL al backend (usuario autenticado)
 * 2. Backend genera URL temporal firmada por AWS
 * 3. App sube el archivo con PUT directamente a S3
 * 4. App guarda la URL pública en Firestore (avatar) o PostgreSQL (adjunto)
 */
import { resolveApiBaseUrl } from "./apiBaseUrl";

const BASE_URL = resolveApiBaseUrl();

export type UploadFolder = "avatars" | "notes";

type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

async function getAuthHeader(): Promise<Record<string, string>> {
  const { getToken } = await import("./token");
  const token = await getToken();
  if (!token) {
    throw new Error("Debes iniciar sesión para subir imágenes");
  }
  return { Authorization: `Bearer ${token}` };
}

async function requestPresignedUrl(
  folder: UploadFolder,
  fileName: string,
  contentType: string,
): Promise<PresignResponse> {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}/uploads/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ folder, fileName, contentType }),
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (res.status === 401) {
        message = "Sesión expirada. Vuelve a iniciar sesión.";
      } else {
        message = body.error ?? message;
      }
    } catch {
      /* respuesta no JSON */
    }
    throw new Error(message);
  }

  return res.json() as Promise<PresignResponse>;
}

/** Pasos 1–3: presigned URL + PUT a S3. Devuelve la URL pública. */
export async function uploadToS3(
  localUri: string,
  options: {
    folder: UploadFolder;
    fileName: string;
    contentType: string;
  },
): Promise<string> {
  const { uploadUrl, publicUrl } = await requestPresignedUrl(
    options.folder,
    options.fileName,
    options.contentType,
  );

  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  const uploadHeaders: Record<string, string> = {
    "Content-Type": options.contentType,
  };
  if (uploadUrl.includes("/api/uploads/local")) {
    Object.assign(uploadHeaders, await getAuthHeader());
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: uploadHeaders,
    body: blob,
  });

  if (!uploadResponse.ok) {
    const detail = await uploadResponse.text().catch(() => "");
    throw new Error(
      detail ? `No se pudo subir la imagen (${uploadResponse.status})` : "No se pudo subir la imagen",
    );
  }

  return publicUrl;
}
