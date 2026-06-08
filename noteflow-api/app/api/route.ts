import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "noteflow-api",
    status: "ok",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      notes: "GET/POST /api/notes (requiere Bearer token)",
      noteById: "GET/PATCH/DELETE /api/notes/:id",
      checklistItems: "GET/POST /api/notes/:id/checklist-items",
      checklistItem: "PATCH/DELETE /api/checklist-items/:itemId",
    },
  });
}
