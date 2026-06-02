import { useEffect } from "react";
import { useNotesStore } from "../store/noteStore";
import { SEED_NOTES, SEED_CHECKLISTS, SEED_IDEAS } from "../constants/seedData";

/**
 * Initializes the store with seed data if it's empty.
 * Should be called once at the top-level screen (dashboard).
 */
export function useSeedData() {
  const store = useNotesStore();

  useEffect(() => {
    if (store.notes.length === 0) {
      SEED_NOTES.forEach((n) => store.addNote(n));
    }
    if (store.checklists.length === 0) {
      SEED_CHECKLISTS.forEach((c) => store.addChecklist(c));
    }
    if (store.ideas.length === 0) {
      SEED_IDEAS.forEach((i) => store.addIdea(i));
    }
  }, []);
}
