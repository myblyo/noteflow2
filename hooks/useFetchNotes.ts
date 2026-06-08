import { useEffect } from "react";
import { useNotesStore } from "../store/noteStore";
import { useAuthStore } from "../store/authStore";
import { getToken } from "../lib/token";

/** Carga las notas desde la API si hay sesión activa. */
export function useFetchNotes() {
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const isReady = useAuthStore((s) => s.isReady);

  useEffect(() => {
    if (!isReady) return;
    getToken().then((token) => {
      if (token) fetchNotes();
    });
  }, [fetchNotes, isReady]);
}
