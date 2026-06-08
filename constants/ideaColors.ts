export interface IdeaColorOption {
  hex: string;
  defaultLabel: string;
}

export const IDEA_COLOR_OPTIONS: IdeaColorOption[] = [
  { hex: "#6366F1", defaultLabel: "Creatividad" },
  { hex: "#22C55E", defaultLabel: "Crecimiento" },
  { hex: "#3B82F6", defaultLabel: "Trabajo" },
  { hex: "#F59E0B", defaultLabel: "Inspiración" },
  { hex: "#EF4444", defaultLabel: "Urgente" },
  { hex: "#EC4899", defaultLabel: "Personal" },
  { hex: "#8B5CF6", defaultLabel: "Proyecto" },
  { hex: "#14B8A6", defaultLabel: "Aprendizaje" },
];

export const DEFAULT_IDEA_COLOR = IDEA_COLOR_OPTIONS[0].hex;

export function buildDefaultIdeaColorLabels(): Record<string, string> {
  return Object.fromEntries(
    IDEA_COLOR_OPTIONS.map((option) => [option.hex, option.defaultLabel]),
  );
}

export function resolveIdeaColorLabel(
  hex: string,
  customLabels: Record<string, string>,
): string {
  const custom = customLabels[hex]?.trim();
  if (custom) return custom;

  const preset = IDEA_COLOR_OPTIONS.find((option) => option.hex === hex);
  return preset?.defaultLabel ?? "Idea";
}
