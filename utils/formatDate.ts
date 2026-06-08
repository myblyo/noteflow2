export function formatDate(
  date: string | Date,
  locale = "es-ES",
  options?: Intl.DateTimeFormatOptions,
): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(locale, options);
}
