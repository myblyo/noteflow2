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
  fileBlob?: Blob,
): Promise<string> {
  const { uploadUrl, publicUrl } = await requestPresignedUrl(
    options.folder,
    options.fileName,
    options.contentType,
  );

  let blob = fileBlob;
  if (!blob) {
    const fileResponse = await fetch(localUri);
    blob = await fileResponse.blob();
  }

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
        ? "Failed to fetch al subir a S3. Configura CORS en el bucket (Permissions → CORS) con tu URL de Vercel. Ver docs/configuracion-aws-s3.md"
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
