import { NextResponse } from "next/server";
import { saveLocalUpload, isValidUploadKey } from "@/lib/local-upload";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";

const MAX_BYTES = 10 * 1024 * 1024;

/** Subida local en desarrollo (sin AWS S3). Mismo flujo que presign + PUT. */
export async function PUT(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key || !isValidUploadKey(key)) {
    return NextResponse.json({ error: "Clave inválida" }, { status: 400 });
  }

  const ownerInKey = key.split("/")[1];
  if (ownerInKey !== auth.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await request.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Archivo vacío" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 413 });
  }

  try {
    await saveLocalUpload(key, buffer);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[uploads/local]", error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
