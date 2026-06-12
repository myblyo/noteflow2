import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  getNoteWithRelations,
  replaceNoteItems,
  replaceNoteTags,
} from "@/lib/notes";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";
import { z } from "zod";

const patchNoteSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  type: z.enum(["note", "checklist", "idea"]).optional(),
  content: z.string().optional(),
  color: z.string().nullable().optional(),
  is_favorite: z.boolean().optional(),
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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const note = await getNoteWithRelations(id, auth.userId);
    if (!note) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const existing = await getNoteWithRelations(id, auth.userId);
    if (!existing) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const result = patchNoteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const { tags, items, ...fields } = result.data;
    const updates: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    const columnMap: Record<string, string> = {
      title: "title",
      type: "type",
      content: "content",
      color: "color",
      is_favorite: "is_favorite",
    };

    for (const [key, column] of Object.entries(columnMap)) {
      const value = fields[key as keyof typeof fields];
      if (value !== undefined) {
        updates.push(`${column} = $${index}`);
        values.push(value);
        index += 1;
      }
    }

    if (updates.length > 0) {
      updates.push("updated_at = NOW()");
      values.push(id, auth.userId);
      await query(
        `UPDATE notes SET ${updates.join(", ")} WHERE id = $${index} AND user_id = $${index + 1}`,
        values,
      );
    }

    if (tags !== undefined) {
      await replaceNoteTags(id, tags);
    }

    if (items !== undefined) {
      await replaceNoteItems(id, items);
    }

    const note = await getNoteWithRelations(id, auth.userId);
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const deleted = await query<{ id: string }>(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, auth.userId],
    );
    if (!deleted.length) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
