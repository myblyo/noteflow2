import { NextResponse } from "next/server";
import {
  createChecklistItem,
  listChecklistItems,
} from "@/lib/checklist-items";
import { noteBelongsToUser } from "@/lib/note-access";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";
import { z } from "zod";

const createItemSchema = z.object({
  task: z.string().min(1),
  is_completed: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    if (!(await noteBelongsToUser(id, auth.userId))) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }
    const items = await listChecklistItems(id);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    if (!(await noteBelongsToUser(id, auth.userId))) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const result = createItemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const item = await createChecklistItem(
      id,
      result.data.task,
      result.data.is_completed,
    );
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
