import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note, ChecklistNote, IdeaNote } from "../types";

interface NotesStore {
    notes: Note[];
    checklists: ChecklistNote[];
    ideas: IdeaNote[];

    selectedNoteId: string | null;
    setSelectedNoteId: (id: string | null) => void;

    addNote: (note: Note) => void;
    addChecklist: (checklist: ChecklistNote) => void;
    addIdea: (idea: IdeaNote) => void;

    deleteNote: (id: string) => void;
    deleteChecklist: (id: string) => void;
    deleteIdea: (id: string) => void;

    toggleNoteFavorite: (id: string) => void;
    toggleIdeaFavorite: (id: string) => void;
    toggleChecklistItem: (checklistId: string, itemId: string) => void;

    updateNote: (id: string, updates: Partial<Pick<Note, "title" | "content">>) => void;
    updateIdea: (id: string, updates: Partial<Pick<IdeaNote, "title" | "description" | "color" | "tags">>) => void;
    updateChecklist: (id: string, updates: Partial<Pick<ChecklistNote, "title" | "items">>) => void;
}

export const useNotesStore = create<NotesStore>()(
    persist(
        (set) => ({
            notes: [],
            checklists: [],
            ideas: [],
            selectedNoteId: null,

            setSelectedNoteId: (id) => set({ selectedNoteId: id }),

            addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
            addChecklist: (checklist) => set((state) => ({ checklists: [...state.checklists, checklist] })),
            addIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),

            deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
            deleteChecklist: (id) => set((state) => ({ checklists: state.checklists.filter((c) => c.id !== id) })),
            deleteIdea: (id) => set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),

            toggleNoteFavorite: (id) =>
                set((state) => ({
                    notes: state.notes.map((n) =>
                        n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date() } : n,
                    ),
                })),

            toggleIdeaFavorite: (id) =>
                set((state) => ({
                    ideas: state.ideas.map((i) =>
                        i.id === id ? { ...i, isFavorite: !i.isFavorite, updatedAt: new Date() } : i,
                    ),
                })),

            toggleChecklistItem: (checklistId, itemId) =>
                set((state) => ({
                    checklists: state.checklists.map((c) =>
                        c.id === checklistId
                            ? {
                                ...c,
                                updatedAt: new Date(),
                                items: c.items.map((item) =>
                                    item.id === itemId
                                        ? { ...item, isCompleted: !item.isCompleted }
                                        : item,
                                ),
                            }
                            : c,
                    ),
                })),

            updateNote: (id, updates) =>
                set((state) => ({
                    notes: state.notes.map((n) =>
                        n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n,
                    ),
                })),

            updateIdea: (id, updates) =>
                set((state) => ({
                    ideas: state.ideas.map((i) =>
                        i.id === id ? { ...i, ...updates, updatedAt: new Date() } : i,
                    ),
                })),

            updateChecklist: (id, updates) =>
                set((state) => ({
                    checklists: state.checklists.map((c) =>
                        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
                    ),
                })),
        }),
        {
            name: "noteflow-storage",           // clave en AsyncStorage
            storage: createJSONStorage(() => AsyncStorage),
            // opcional: excluir selectedNoteId de la persistencia
            partialize: (state) => ({
                notes: state.notes,
                checklists: state.checklists,
                ideas: state.ideas,
            }),
        },
    ),
);