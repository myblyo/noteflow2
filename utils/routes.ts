import type { Href } from "expo-router";

export const TAB_ROUTES = {
  index: "/(tabs)" as Href,
  notas: "/(tabs)/notas" as Href,
  ideas: "/(tabs)/ideas" as Href,
  todo: "/(tabs)/todo" as Href,
} as const;

export type TabRouteName = keyof typeof TAB_ROUTES;

export function ideaDetailRoute(id: string): Href {
  return { pathname: "/idea/[id]", params: { id } };
}

export function noteDetailRoute(id: string): Href {
  return { pathname: "/nota/[id]", params: { id } };
}

export function checklistDetailRoute(id: string): Href {
  return { pathname: "/checklist/[id]", params: { id } };
}

export function nuevaNotaRoute(type?: "note" | "idea" | "checklist"): Href {
  if (!type || type === "note") return "/nueva-nota";
  return { pathname: "/nueva-nota", params: { type } };
}

export const DETAIL_FALLBACKS = {
  note: TAB_ROUTES.notas,
  idea: TAB_ROUTES.ideas,
  checklist: TAB_ROUTES.todo,
  nuevaNota: TAB_ROUTES.notas,
} as const;
