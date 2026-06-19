import { NextResponse } from "next/server";
import {
  deleteChecklistItem,
  getChecklistItem,
  toggleChecklistItem,
  updateChecklistItem,
} from "@/lib/checklist-items";
import { checklistItemBelongsToUser } from "@/lib/note-access";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";
import { z } from "zod";

const patchItemSchema = z.object({
  is_completed: z.boolean().optional(),
  task: z.string().trim().min(1).max(500).optional(),
});

type RouteContext = { params: Promise<{ itemId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { itemId } = await params;
    if (!(await checklistItemBelongsToUser(itemId, auth.userId))) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 },
      );
    }

    const existing = await getChecklistItem(itemId);
    if (!existing) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 },
      );
    }

    const text = await request.text();
    if (!text) {
      const item = await toggleChecklistItem(itemId);
      return NextResponse.json(item);
    }

    const result = patchItemSchema.safeParse(JSON.parse(text));
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const { is_completed, task } = result.data;
    if (is_completed === undefined && task === undefined) {
      const item = await toggleChecklistItem(itemId);
      return NextResponse.json(item);
    }

    const item = await updateChecklistItem(itemId, { is_completed, task });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { itemId } = await params;
    if (!(await checklistItemBelongsToUser(itemId, auth.userId))) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 },
      );
    }

    const deleted = await deleteChecklistItem(itemId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 },
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
