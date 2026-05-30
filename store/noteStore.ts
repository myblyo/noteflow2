import { create } from "zustand";

import {
    Note,
    ChecklistNote,
    IdeaNote,
} from "../types";

interface NotesStore {
    notes: Note[];
    checklists: ChecklistNote[];
    ideas: IdeaNote[];

    addNote: (note: Note) => void;
    addChecklist: (checklist: ChecklistNote) => void;
    addIdea: (idea: IdeaNote) => void;

    deleteNote: (id: string) => void;
    deleteChecklist: (id: string) => void;
    deleteIdea: (id: string) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
    notes: [],
    checklists: [],
    ideas: [],

    addNote: (note) =>
        set((state) => ({
            notes: [...state.notes, note],
        })),

    addChecklist: (checklist) =>
        set((state) => ({
            checklists: [...state.checklists, checklist],
        })),

    addIdea: (idea) =>
        set((state) => ({
            ideas: [...state.ideas, idea],
        })),

    deleteNote: (id) =>
        set((state) => ({
            notes: state.notes.filter((n) => n.id !== id),
        })),

    deleteChecklist: (id) =>
        set((state) => ({
            checklists: state.checklists.filter((c) => c.id !== id),
        })),

    deleteIdea: (id) =>
        set((state) => ({
            ideas: state.ideas.filter((i) => i.id !== id),
        })),
}));