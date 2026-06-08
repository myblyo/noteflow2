import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "../types/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../data/db.json");

const DEFAULT_IDEA_COLOR_LABELS: Record<string, string> = {
  "#6366F1": "Creatividad",
  "#22C55E": "Crecimiento",
  "#3B82F6": "Trabajo",
  "#F59E0B": "Inspiración",
  "#EF4444": "Urgente",
  "#EC4899": "Personal",
  "#8B5CF6": "Proyecto",
  "#14B8A6": "Aprendizaje",
};

const SEED: Database = {
  notes: [
    {
      id: "n1",
      title: "La importancia de la tecnología en la vida cotidiana",
      content: "Description",
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "n2",
      title: "Title",
      content: "Description",
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  checklists: [
    {
      id: "c1",
      title: "Weekly tasks",
      items: [
        { id: "t1", task: "Review notes", isCompleted: false },
        { id: "t2", task: "Plan ideas", isCompleted: true },
      ],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  ideas: [
    {
      id: "i1",
      title: "New feature",
      description: "Connect mobile app to REST API",
      tags: ["backend"],
      color: "#6366F1",
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  ideaColorLabels: DEFAULT_IDEA_COLOR_LABELS,
};

let cache: Database | null = null;

async function ensureDbFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(SEED, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<Database> {
  if (cache) return cache;
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  cache = JSON.parse(raw) as Database;
  return cache;
}

export async function writeDb(data: Database): Promise<void> {
  cache = data;
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function nowIso() {
  return new Date().toISOString();
}
