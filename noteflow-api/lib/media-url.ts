/** URL pública servida por la API (funciona con S3 privado y uploads locales). */
export function buildPublicMediaUrl(apiOrigin: string, key: string): string {
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${apiOrigin.replace(/\/$/, "")}/api/media/${encoded}`;
}
