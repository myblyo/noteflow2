import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getNoteWithRelations, insertNoteRelations } from "@/lib/notes";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().min(3),
  type: z.enum(["note", "checklist", "idea"]),
  content: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
  items: z
    .array(
      z.object({
        task: z.string().min(1),
        is_completed: z.boolean().optional(),
      }),
    )
    .optional(),
});

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const notes = await query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC",
      [auth.userId],
    );
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await request.json();
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }
    const { title, type, content, color, tags, items } = result.data;
    const id = randomUUID();
    await query(
      "INSERT INTO notes (id, user_id, title, type, content, color) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, auth.userId, title, type, content ?? "", color ?? null],
    );
    await insertNoteRelations(id, tags, items);
    const note = await getNoteWithRelations(id, auth.userId);
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
