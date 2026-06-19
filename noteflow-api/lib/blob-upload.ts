import { randomUUID } from "node:crypto";

const KEY_PATTERN = /^(avatars|notes)\/[^/]+\/[^/]+$/;

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isValidBlobKey(key: string): boolean {
  if (key.includes("..")) return false;
  return KEY_PATTERN.test(key);
}

export function createBlobUploadUrls(input: {
  folder: "avatars" | "notes";
  fileName: string;
  userId: string;
  apiOrigin: string;
}): { uploadUrl: string; publicUrl: string; key: string } {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${input.folder}/${input.userId}/${randomUUID()}-${safeName}`;
  const uploadUrl = `${input.apiOrigin}/api/uploads/blob?key=${encodeURIComponent(key)}`;

  return { uploadUrl, publicUrl: "", key };
}

export async function saveBlobUpload(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN no configurado");
  }

  const { put } = await import("@vercel/blob");
  const blob = await put(key, body, {
    access: "public",
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}
