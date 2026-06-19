import { NextResponse } from "next/server";
import {
  isValidBlobKey,
  saveBlobUpload,
} from "@/lib/blob-upload";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";

const MAX_BYTES = 10 * 1024 * 1024;

/** Subida en Vercel Blob (producción sin AWS S3). */
export async function PUT(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key || !isValidBlobKey(key)) {
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
    return NextResponse.json(
      { error: "Archivo demasiado grande" },
      { status: 413 },
    );
  }

  try {
    const publicUrl = await saveBlobUpload(key, buffer, contentType);
    return NextResponse.json({ ok: true, publicUrl });
  } catch (error) {
    console.error("[uploads/blob]", error);
    const message =
      error instanceof Error && error.message.includes("BLOB_READ_WRITE_TOKEN")
        ? "Almacenamiento Blob no configurado. En Vercel: Storage → Create Blob Store → conectar a noteflow2-api."
        : "Error al guardar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
