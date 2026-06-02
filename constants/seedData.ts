import type { Note, ChecklistNote, IdeaNote } from "../types";

// ─── Seed data ──────────────────────────────────────────────────

export const SEED_NOTES: Note[] = [
  {
    id: "n1",
    title: "La importancia de la tecnología en la vida cotidiana",
    content: "Description",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "n2",
    title: "Title",
    content: "Description",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "n3",
    title: "Title",
    content: "Description",
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "n4",
    title: "Title",
    content: "Description",
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const SEED_CHECKLISTS: ChecklistNote[] = [
  {
    id: "c1",
    title: "To Do",
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      { id: "ci1", task: "Title", isCompleted: true },
      { id: "ci2", task: "Title", isCompleted: true },
      { id: "ci3", task: "Title", isCompleted: true },
      { id: "ci4", task: "Title", isCompleted: true },
      { id: "ci5", task: "Title", isCompleted: true },
    ],
  },
];

export const SEED_IDEAS: IdeaNote[] = [
  {
    id: "i1",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#6366F1",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "i2",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#22C55E",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "i3",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#3B82F6",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "i4",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#F59E0B",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "i5",
    title: "Title",
    description: "Description",
    tags: [],
    color: "#EF4444",
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
