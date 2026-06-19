import { NextResponse } from "next/server";
import { query, formatDbError } from "@/lib/db";

export async function GET() {
  try {
    await query("SELECT 1 AS ok");
    return NextResponse.json({ ok: true, db: true });
  } catch (error) {
    const message = formatDbError(error);
    console.error("[health]", error);
    return NextResponse.json(
      {
        ok: false,
        db: false,
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "Error de base de datos",
      },
      { status: 503 },
    );
  }
}
