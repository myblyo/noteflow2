import type { AnyNote, ChecklistNote, IdeaNote, Note } from "../types";
import { resolveApiBaseUrl } from "./apiBaseUrl";

const BASE_URL = resolveApiBaseUrl();

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export type AuthResponse = {
  token: string;
  user: { id: string; email: string; name: string };
};

export type ApiChecklistItem = {
  id: string;
  note_id: string;
  task: string;
  is_completed: boolean;
  position: number;
};

export type ApiNote = {
  id: string;
  title: string;
  type: "note" | "checklist" | "idea";
  content: string;
  color: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
  items?: Array<{ id: string; task: string; is_completed: boolean }>;
  attachment_preview?: string | null;
  attachment_count?: number;
};

export type CreateNoteInput = {
  title: string;
  type: "note" | "checklist" | "idea";
  content?: string;
  color?: string;
  tags?: string[];
  items?: Array<{ task: string; is_completed?: boolean }>;
};

export type UpdateNoteInput = {
  title?: string;
  type?: "note" | "checklist" | "idea";
  content?: string;
  color?: string | null;
  is_favorite?: boolean;
  tags?: string[];
  items?: Array<{ task: string; is_completed?: boolean }>;
};

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: { auth?: boolean },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (options?.auth !== false && authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error(
      `No se puede conectar con la API (${BASE_URL}). Arranca la API: npm run api`,
    );
  }
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = (await res.json()) as {
        error?: string;
        errors?: Array<{ message?: string; path?: (string | number)[] }>;
      };
      if (body.errors?.length) {
        message = body.errors
          .map((issue) => issue.message ?? "Dato inválido")
          .join(". ");
      } else {
        message = body.error ?? message;
      }
    } catch {
      /* respuesta no JSON */
    }
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function mapApiNote(row: ApiNote): AnyNote {
  const base = {
    id: row.id,
    title: row.title,
    isFavorite: row.is_favorite,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };

  if (row.type === "checklist") {
    return {
      ...base,
      items: (row.items ?? []).map((item) => ({
        id: item.id,
        task: item.task,
        isCompleted: item.is_completed,
      })),
    } satisfies ChecklistNote;
  }

  if (row.type === "idea") {
    return {
      ...base,
      description: row.content,
      tags: row.tags ?? [],
      color: row.color ?? "#6366F1",
    } satisfies IdeaNote;
  }

  return {
    ...base,
    content: row.content,
    attachmentPreviewUrl: row.attachment_preview ?? null,
    attachmentCount: row.attachment_count ?? 0,
  } satisfies Note;
}

export function splitNotesByType(rows: ApiNote[]) {
  const notes: Note[] = [];
  const checklists: ChecklistNote[] = [];
  const ideas: IdeaNote[] = [];

  for (const row of rows) {
    const mapped = mapApiNote(row);
    if (row.type === "checklist") checklists.push(mapped as ChecklistNote);
    else if (row.type === "idea") ideas.push(mapped as IdeaNote);
    else notes.push(mapped as Note);
  }

  return { notes, checklists, ideas };
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    },
    { auth: false },
  );
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    { auth: false },
  );
}

export async function getNotes(): Promise<ApiNote[]> {
  return apiFetch<ApiNote[]>("/notes");
}

export async function getNoteById(id: string): Promise<ApiNote> {
  return apiFetch<ApiNote>(`/notes/${id}`);
}

export async function fetchNotesDetailed(): Promise<ApiNote[]> {
  const list = await getNotes();
  return Promise.all(
    list.map((note) =>
      note.type === "note" ? Promise.resolve(note) : getNoteById(note.id),
    ),
  );
}

export async function createNote(data: CreateNoteInput): Promise<ApiNote> {
  return apiFetch<ApiNote>("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateNote(
  id: string,
  data: UpdateNoteInput,
): Promise<ApiNote> {
  return apiFetch<ApiNote>(`/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await apiFetch<void>(`/notes/${id}`, { method: "DELETE" });
}

export async function getChecklistItems(
  noteId: string,
): Promise<ApiChecklistItem[]> {
  return apiFetch<ApiChecklistItem[]>(`/notes/${noteId}/checklist-items`);
}

export async function createChecklistItem(
  noteId: string,
  task: string,
  is_completed = false,
): Promise<ApiChecklistItem> {
  return apiFetch<ApiChecklistItem>(`/notes/${noteId}/checklist-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, is_completed }),
  });
}

export async function patchChecklistItem(
  itemId: string,
  is_completed?: boolean,
): Promise<ApiChecklistItem> {
  return apiFetch<ApiChecklistItem>(`/checklist-items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      is_completed === undefined ? {} : { is_completed },
    ),
  });
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  await apiFetch<void>(`/checklist-items/${itemId}`, { method: "DELETE" });
}

export type ApiNoteAttachment = {
  id: string;
  note_id: string;
  url: string;
  owner_id: string;
  created_at: string;
};

export async function getNoteAttachments(
  noteId: string,
): Promise<ApiNoteAttachment[]> {
  return apiFetch<ApiNoteAttachment[]>(`/notes/${noteId}/attachments`);
}

/** Paso 4 (notas): guarda la URL pública en PostgreSQL */
export async function addNoteAttachment(
  noteId: string,
  url: string,
): Promise<ApiNoteAttachment> {
  return apiFetch<ApiNoteAttachment>(`/notes/${noteId}/attachments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export async function deleteNoteAttachment(attachmentId: string): Promise<void> {
  await apiFetch<void>(`/note-attachments/${attachmentId}`, {
    method: "DELETE",
  });
}
