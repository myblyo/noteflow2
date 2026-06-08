import { NextResponse } from "next/server";
import {
  deleteChecklistItem,
  getChecklistItem,
  toggleChecklistItem,
} from "@/lib/checklist-items";
import { checklistItemBelongsToUser } from "@/lib/note-access";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";
import { z } from "zod";

const patchItemSchema = z.object({
  is_completed: z.boolean().optional(),
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
    let isCompleted: boolean | undefined;

    if (text) {
      const result = patchItemSchema.safeParse(JSON.parse(text));
      if (!result.success) {
        return NextResponse.json(
          { errors: result.error.issues },
          { status: 400 },
        );
      }
      isCompleted = result.data.is_completed;
    }

    const item = await toggleChecklistItem(itemId, isCompleted);
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
