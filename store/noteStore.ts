import { create } from "zustand";
import { Note, ChecklistNote, IdeaNote } from "../types";
import type { SelectedItem, SelectionItemType } from "../types/selection";
import { buildDefaultIdeaColorLabels } from "../constants/ideaColors";
import * as api from "../lib/api";

function mapChecklistItem(item: api.ApiChecklistItem) {
  return {
    id: item.id,
    task: item.task,
    isCompleted: item.is_completed,
  };
}

interface NotesStore {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  ideaColorLabels: Record<string, string>;
  isLoading: boolean;
  error: string | null;

  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;

  selectionMode: boolean;
  selectedItems: SelectedItem[];
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleItemSelected: (id: string, type: SelectionItemType) => void;
  deleteSelectedItems: () => Promise<void>;

  fetchNotes: () => Promise<void>;

  addNote: (data: { title: string; content: string }) => Promise<Note>;
  addChecklist: (data: { title: string }) => Promise<ChecklistNote>;
  addIdea: (data: {
    title: string;
    description: string;
    color?: string;
  }) => Promise<IdeaNote>;

  deleteNote: (id: string) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;

  toggleNoteFavorite: (id: string) => Promise<void>;
  toggleIdeaFavorite: (id: string) => Promise<void>;
  toggleChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
  addChecklistItem: (checklistId: string, task: string) => Promise<void>;

  updateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>,
  ) => Promise<void>;
  updateIdea: (
    id: string,
    updates: Partial<Pick<IdeaNote, "title" | "description" | "color" | "tags">>,
  ) => Promise<void>;
  updateChecklist: (
    id: string,
    updates: Partial<Pick<ChecklistNote, "title" | "items">>,
  ) => Promise<void>;
  setIdeaColorLabel: (hex: string, label: string) => void;
  setNoteAttachmentMeta: (
    id: string,
    previewUrl: string | null,
    count: number,
  ) => void;
}

export const useNotesStore = create<NotesStore>()((set, get) => ({
  notes: [],
  checklists: [],
  ideas: [],
  ideaColorLabels: buildDefaultIdeaColorLabels(),
  isLoading: false,
  error: null,
  selectedNoteId: null,
  searchQuery: "",
  showFavoritesOnly: false,
  selectionMode: false,
  selectedItems: [],

  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

  enterSelectionMode: () => set({ selectionMode: true }),
  exitSelectionMode: () => set({ selectionMode: false, selectedItems: [] }),
  toggleItemSelected: (id, type) =>
    set((state) => {
      const exists = state.selectedItems.some(
        (item) => item.id === id && item.type === type,
      );
      return {
        selectedItems: exists
          ? state.selectedItems.filter(
              (item) => !(item.id === id && item.type === type),
            )
          : [...state.selectedItems, { id, type }],
      };
    }),

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const rows = await api.fetchNotesDetailed();
      const { notes, checklists, ideas } = api.splitNotesByType(rows);
      set({ notes, checklists, ideas, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Error al cargar notas",
      });
    }
  },

  deleteSelectedItems: async () => {
    const state = get();
    const noteIds = new Set(
      state.selectedItems.filter((i) => i.type === "note").map((i) => i.id),
    );
    const ideaIds = new Set(
      state.selectedItems.filter((i) => i.type === "idea").map((i) => i.id),
    );
    const checklistIds = new Set(
      state.selectedItems
        .filter((i) => i.type === "checklist")
        .map((i) => i.id),
    );

    set({ isLoading: true, error: null });
    try {
      await Promise.all(
        [...noteIds, ...ideaIds, ...checklistIds].map((id) =>
          api.deleteNote(id),
        ),
      );
      set({
        notes: state.notes.filter((n) => !noteIds.has(n.id)),
        ideas: state.ideas.filter((i) => !ideaIds.has(i.id)),
        checklists: state.checklists.filter((c) => !checklistIds.has(c.id)),
        selectedNoteId: noteIds.has(state.selectedNoteId ?? "")
          ? null
          : state.selectedNoteId,
        selectionMode: false,
        selectedItems: [],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Error al eliminar",
      });
    }
  },

  addNote: async (data) => {
    set({ error: null });
    const row = await api.createNote({
      title: data.title,
      type: "note",
      content: data.content,
    });
    const note = api.mapApiNote(row) as Note;
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },

  addChecklist: async (data) => {
    set({ error: null });
    const row = await api.createNote({
      title: data.title,
      type: "checklist",
      content: "",
      items: [],
    });
    const checklist = api.mapApiNote(row) as ChecklistNote;
    set((state) => ({ checklists: [checklist, ...state.checklists] }));
    return checklist;
  },

  addIdea: async (data) => {
    set({ error: null });
    const row = await api.createNote({
      title: data.title,
      type: "idea",
      content: data.description,
      color: data.color,
      tags: [],
    });
    const idea = api.mapApiNote(row) as IdeaNote;
    set((state) => ({ ideas: [idea, ...state.ideas] }));
    return idea;
  },

  deleteNote: async (id) => {
    set({ error: null });
    await api.deleteNote(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId:
        state.selectedNoteId === id ? null : state.selectedNoteId,
    }));
  },

  deleteChecklist: async (id) => {
    set({ error: null });
    await api.deleteNote(id);
    set((state) => ({
      checklists: state.checklists.filter((c) => c.id !== id),
    }));
  },

  deleteIdea: async (id) => {
    set({ error: null });
    await api.deleteNote(id);
    set((state) => ({
      ideas: state.ideas.filter((i) => i.id !== id),
    }));
  },

  toggleNoteFavorite: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    set({ error: null });
    const row = await api.updateNote(id, { is_favorite: !note.isFavorite });
    const updated = api.mapApiNote(row) as Note;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  toggleIdeaFavorite: async (id) => {
    const idea = get().ideas.find((i) => i.id === id);
    if (!idea) return;
    set({ error: null });
    const row = await api.updateNote(id, { is_favorite: !idea.isFavorite });
    const updated = api.mapApiNote(row) as IdeaNote;
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === id ? updated : i)),
    }));
  },

  toggleChecklistItem: async (checklistId, itemId) => {
    set({ error: null });
    const item = await api.patchChecklistItem(itemId);
    const mapped = mapChecklistItem(item);
    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.id === checklistId
          ? {
              ...c,
              updatedAt: new Date(),
              items: c.items.map((i) => (i.id === itemId ? mapped : i)),
            }
          : c,
      ),
    }));
  },

  addChecklistItem: async (checklistId, task) => {
    set({ error: null });
    const item = await api.createChecklistItem(checklistId, task);
    const mapped = mapChecklistItem(item);
    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.id === checklistId
          ? { ...c, updatedAt: new Date(), items: [...c.items, mapped] }
          : c,
      ),
    }));
  },

  updateNote: async (id, updates) => {
    set({ error: null });
    try {
      const row = await api.updateNote(id, {
        title: updates.title,
        content: updates.content,
      });
      const updated = api.mapApiNote(row) as Note;
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id
            ? {
                ...updated,
                attachmentPreviewUrl:
                  updated.attachmentPreviewUrl ?? n.attachmentPreviewUrl,
                attachmentCount: updated.attachmentCount ?? n.attachmentCount,
              }
            : n,
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al guardar la nota",
      });
    }
  },

  updateIdea: async (id, updates) => {
    set({ error: null });
    const row = await api.updateNote(id, {
      title: updates.title,
      content: updates.description,
      color: updates.color,
      tags: updates.tags,
    });
    const updated = api.mapApiNote(row) as IdeaNote;
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === id ? updated : i)),
    }));
  },

  updateChecklist: async (id, updates) => {
    set({ error: null });
    if (updates.title !== undefined) {
      const row = await api.updateNote(id, { title: updates.title });
      const title = row.title;
      set((state) => ({
        checklists: state.checklists.map((c) =>
          c.id === id
            ? { ...c, title, updatedAt: new Date(row.updated_at) }
            : c,
        ),
      }));
    }
    if (updates.items !== undefined) {
      const row = await api.updateNote(id, {
        items: updates.items.map((item) => ({
          task: item.task,
          is_completed: item.isCompleted,
        })),
      });
      const updated = api.mapApiNote(row) as ChecklistNote;
      set((state) => ({
        checklists: state.checklists.map((c) => (c.id === id ? updated : c)),
      }));
    }
  },

  setIdeaColorLabel: (hex, label) =>
    set((state) => ({
      ideaColorLabels: {
        ...state.ideaColorLabels,
        [hex]: label,
      },
    })),

  setNoteAttachmentMeta: (id, previewUrl, count) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id
          ? { ...n, attachmentPreviewUrl: previewUrl, attachmentCount: count }
          : n,
      ),
    })),
}));
