import { useEffect } from "react";
import { useNotesStore } from "../store/noteStore";
import { useAuthStore } from "../store/authStore";

/** Carga las notas desde la API si hay sesión activa. */
export function useFetchNotes() {
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const isReady = useAuthStore((s) => s.isReady);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isReady || !user) return;
    fetchNotes();
  }, [fetchNotes, isReady, user]);
}
