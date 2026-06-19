import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    await query("SELECT 1 AS ok");
    return NextResponse.json({ ok: true, db: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error de base de datos";
    console.error("[health]", error);
    return NextResponse.json(
      { ok: false, db: false, error: message },
      { status: 503 },
    );
  }
}
