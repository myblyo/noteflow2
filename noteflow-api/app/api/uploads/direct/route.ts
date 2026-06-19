import { NextResponse } from "next/server";
import { z } from "zod";
import { buildS3Key, isS3Configured, uploadObjectToS3 } from "@/lib/s3";
import { saveLocalUpload } from "@/lib/local-upload";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";

const MAX_BYTES = 10 * 1024 * 1024;
const folderSchema = z.enum(["avatars", "notes"]);

/** Subida vía API → S3 (evita CORS del navegador en Vercel web). */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = formData.get("folder");
    const contentTypeRaw = formData.get("contentType");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const folderResult = folderSchema.safeParse(folderRaw);
    if (!folderResult.success) {
      return NextResponse.json({ error: "Carpeta inválida" }, { status: 400 });
    }

    const contentType =
      typeof contentTypeRaw === "string" && contentTypeRaw.startsWith("image/")
        ? contentTypeRaw
        : file.type.startsWith("image/")
          ? file.type
          : "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json({ error: "Archivo vacío" }, { status: 400 });
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 413 });
    }

    const fileName = file.name || "image.jpg";
    const folder = folderResult.data;

    if (isS3Configured()) {
      const result = await uploadObjectToS3({
        folder,
        fileName,
        contentType,
        userId: auth.userId,
        body: buffer,
      });
      return NextResponse.json(result);
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Subida de imágenes no configurada. Añade AWS_S3_BUCKET, AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en el proyecto API.",
        },
        { status: 503 },
      );
    }

    const key = buildS3Key({ folder, fileName, userId: auth.userId });
    await saveLocalUpload(key, buffer);
    const apiOrigin = new URL(request.url).origin;
    return NextResponse.json({
      publicUrl: `${apiOrigin}/uploads/${key}`,
      key,
    });
  } catch (error) {
    console.error("[uploads/direct]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
