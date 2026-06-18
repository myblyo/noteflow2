import { NextResponse } from "next/server";
import { deleteNoteAttachment } from "@/lib/note-attachments";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";

type RouteContext = { params: Promise<{ attachmentId: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth(_request);
  if (isAuthResponse(auth)) return auth;

  try {
    const { attachmentId } = await params;
    const deleted = await deleteNoteAttachment(attachmentId, auth.userId);
    if (!deleted) {
      return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[attachment DELETE]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
