export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface BaseNote {
    id: string;
    title: string;
    createdAt: Date;
    updateAt: Date;
}

export interface Note extends BaseNote {
    content: string;
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
    tags: string[];
    color: string;
}

export type AnyNote = Note | ChecklistNote | IdeaNote;