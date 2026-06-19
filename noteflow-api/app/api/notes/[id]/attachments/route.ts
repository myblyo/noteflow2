import { NextResponse } from "next/server";
import { z } from "zod";
import {
  insertNoteAttachment,
  listNoteAttachments,
} from "@/lib/note-attachments";
import { noteBelongsToUser } from "@/lib/note-access";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";

type RouteContext = { params: Promise<{ id: string }> };

const attachmentSchema = z.object({
  url: z.string().min(1),
});

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth(_request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    if (!(await noteBelongsToUser(id, auth.userId))) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }
    const attachments = await listNoteAttachments(id);
    return NextResponse.json(attachments);
  } catch (error) {
    console.error("[attachments GET]", error);
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
    const result = attachmentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const attachment = await insertNoteAttachment({
      noteId: id,
      url: result.data.url,
      ownerId: auth.userId,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("[attachments POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
