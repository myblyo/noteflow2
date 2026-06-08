/**
 * Normaliza texto para búsqueda tipo Ctrl+F:
 * minúsculas, sin acentos ni diacríticos.
 */
export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

/**
 * Comprueba si el texto contiene la consulta (subcadena) o,
 * si hay varias palabras, si todas aparecen en algún punto del texto.
 */
export function matchesSearch(
  query: string,
  ...fields: (string | undefined | null)[]
): boolean {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeForSearch(
    fields.filter((f) => f != null && f !== "").join(" "),
  );
  if (!haystack) return false;

  if (haystack.includes(normalizedQuery)) return true;

  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  return words.every((word) => haystack.includes(word));
}
