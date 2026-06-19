import { resolveApiBaseUrl } from "./apiBaseUrl";

const STORAGE_KEY_RE = /((?:avatars|notes)\/[^/?#]+)/;

/** Extrae la clave S3/local (avatars/… o notes/…) desde una URL guardada. */
export function extractStorageKey(url: string): string | null {
  if (!url || url.startsWith("blob:") || url.startsWith("data:")) {
    return null;
  }

  if (/^(avatars|notes)\//.test(url)) {
    return url;
  }

  const proxied = url.match(/\/api\/media\/((?:avatars|notes)\/[^?#]+)/);
  if (proxied) {
    return decodeURIComponent(proxied[1]);
  }

  const match = url.match(STORAGE_KEY_RE);
  return match ? decodeURIComponent(match[1]) : null;
}

function encodeMediaPath(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

/**
 * URL para mostrar imágenes almacenadas (S3 privado o uploads locales vía API).
 * Las URLs blob/data se devuelven sin cambios.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  const key = extractStorageKey(url);
  if (!key) return url;

  return `${resolveApiBaseUrl()}/media/${encodeMediaPath(key)}`;
}
