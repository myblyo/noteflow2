export interface Note {
  id: string;
  title: string;
  content: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  isCompleted: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  color: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  notes: Note[];
  checklists: Checklist[];
  ideas: Idea[];
  ideaColorLabels: Record<string, string>;
}
