export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface BaseNote {
    id: string;
    title: string;
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Note extends BaseNote {
    content: string;
    attachmentPreviewUrl?: string | null;
    attachmentCount?: number;
}

export interface ChecklistItem {
    id: string;
    task: string;
    isCompleted: boolean;
}

export interface ChecklistNote extends BaseNote {
    items: ChecklistItem[];
}

export interface IdeaNote extends BaseNote {
    description: string;
    tags: string[];
    color: string;
}

/** Union AnyNote */
export type AnyNote = Note | ChecklistNote | IdeaNote;


/** Implementar guardas para cada tipo de nota*/
export function isNote(note: AnyNote): note is Note {
    return "content" in note;
}

export function isChecklistNote(note: AnyNote): note is ChecklistNote {
    return "items" in note;
}

export function isIdeaNote(note: AnyNote): note is IdeaNote {
    return "tags" in note && "color" in note;
}

/** Filter categories for the top bar */
export type NoteType = "all" | "notes" | "ideas" | "todo";

