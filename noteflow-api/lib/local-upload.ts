import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const KEY_PATTERN = /^(avatars|notes)\/[^/]+\/[^/]+$/;

export function isValidUploadKey(key: string): boolean {
  if (key.includes("..")) return false;
  return KEY_PATTERN.test(key);
}

export function createLocalUploadUrls(input: {
  folder: "avatars" | "notes";
  fileName: string;
  userId: string;
  apiOrigin: string;
}): { uploadUrl: string; publicUrl: string; key: string } {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${input.folder}/${input.userId}/${randomUUID()}-${safeName}`;
  const uploadUrl = `${input.apiOrigin}/api/uploads/local?key=${encodeURIComponent(key)}`;
  const publicUrl = `${input.apiOrigin}/uploads/${key}`;

  return { uploadUrl, publicUrl, key };
}

export async function saveLocalUpload(key: string, body: Buffer): Promise<void> {
  if (!isValidUploadKey(key)) {
    throw new Error("Clave de subida inválida");
  }

  const filePath = path.join(UPLOADS_DIR, ...key.split("/"));
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);
}
