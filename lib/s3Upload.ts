/**
 * Flujo seguro de subida a S3:
 * 1. App pide URL al backend (presign) o sube directo (web → /uploads/direct)
 * 2. Backend verifica sesión y escribe en S3 (o almacenamiento local en dev)
 * 3. App guarda la URL pública en PostgreSQL / Firestore
 */
import { Platform } from "react-native";
import { resolveApiBaseUrl } from "./apiBaseUrl";

const BASE_URL = resolveApiBaseUrl();

export type UploadFolder = "avatars" | "notes";

type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

type DirectUploadResponse = {
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

/** Web/Vercel: sube por la API (sin CORS hacia S3). Móvil: presign + PUT. */
async function uploadDirect(
  blob: Blob,
  options: {
    folder: UploadFolder;
    fileName: string;
    contentType: string;
  },
): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, options.fileName);
  formData.append("folder", options.folder);
  formData.append("contentType", options.contentType);

  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}/uploads/direct`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      /* respuesta no JSON */
    }
    throw new Error(message);
  }

  const data = (await res.json()) as DirectUploadResponse;
  return data.publicUrl;
}

/** Pasos 1–3: subida + URL pública. */
export async function uploadToS3(
  localUri: string,
  options: {
    folder: UploadFolder;
    fileName: string;
    contentType: string;
  },
  fileBlob?: Blob,
): Promise<string> {
  let blob = fileBlob;
  if (!blob) {
    const fileResponse = await fetch(localUri);
    blob = await fileResponse.blob();
  }

  if (Platform.OS === "web") {
    return uploadDirect(blob, options);
  }

  const { uploadUrl, publicUrl } = await requestPresignedUrl(
    options.folder,
    options.fileName,
    options.contentType,
  );

  const uploadHeaders: Record<string, string> = {
    "Content-Type": options.contentType,
  };
  if (uploadUrl.includes("/api/uploads/local")) {
    Object.assign(uploadHeaders, await getAuthHeader());
  }

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: uploadHeaders,
      body: blob,
    });
  } catch {
    const isS3 = uploadUrl.includes("amazonaws.com");
    throw new Error(
      isS3
        ? "No se pudo conectar con S3. Comprueba la configuración AWS."
        : "No se pudo conectar para subir la imagen. Comprueba que la API está en marcha.",
    );
  }

  if (!uploadResponse.ok) {
    const detail = await uploadResponse.text().catch(() => "");
    throw new Error(
      detail ? `No se pudo subir la imagen (${uploadResponse.status})` : "No se pudo subir la imagen",
    );
  }

  return publicUrl;
}

/** Sube un Blob/File directamente (web: drag & drop o input file). */
export async function uploadBlobToS3(
  blob: Blob,
  options: {
    folder: UploadFolder;
    fileName: string;
    contentType: string;
  },
): Promise<string> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await uploadToS3(objectUrl, options, blob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
