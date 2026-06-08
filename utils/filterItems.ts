import type { Note, IdeaNote, ChecklistNote } from "../types";
import { matchesSearch } from "./search";

export function filterNotes(
  notes: Note[],
  query: string,
  favoritesOnly = false,
): Note[] {
  let result = notes;
  if (favoritesOnly) result = result.filter((note) => note.isFavorite);
  if (!query.trim()) return result;
  return result.filter((note) =>
    matchesSearch(query, note.title, note.content),
  );
}

export function filterIdeas(
  ideas: IdeaNote[],
  query: string,
  favoritesOnly = false,
): IdeaNote[] {
  let result = ideas;
  if (favoritesOnly) result = result.filter((idea) => idea.isFavorite);
  if (!query.trim()) return result;
  return result.filter((idea) =>
    matchesSearch(query, idea.title, idea.description, idea.tags.join(" ")),
  );
}

export function filterChecklists(
  checklists: ChecklistNote[],
  query: string,
  favoritesOnly = false,
): ChecklistNote[] {
  let result = checklists;
  if (favoritesOnly) result = result.filter((checklist) => checklist.isFavorite);
  if (!query.trim()) return result;

  return result
    .map((checklist) => {
      const titleMatches = matchesSearch(query, checklist.title);
      const matchingItems = checklist.items.filter((item) =>
        matchesSearch(query, item.task),
      );

      if (titleMatches) return checklist;
      if (matchingItems.length === 0) return null;

      return { ...checklist, items: matchingItems };
    })
    .filter((c): c is ChecklistNote => c !== null);
}
