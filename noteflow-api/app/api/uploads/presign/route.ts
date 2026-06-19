import { NextResponse } from "next/server";
import { z } from "zod";
import { createLocalUploadUrls } from "@/lib/local-upload";
import { buildPublicMediaUrl } from "@/lib/media-url";
import { createPresignedUploadUrl, isS3Configured } from "@/lib/s3";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";

const presignSchema = z.object({
  folder: z.enum(["avatars", "notes"]),
  fileName: z.string().min(1).max(255),
  contentType: z.string().regex(/^image\//),
});

/** Paso 1–2: usuario autenticado → URL de subida (S3 o almacenamiento local en dev) */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await request.json();
    const result = presignSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const input = { ...result.data, userId: auth.userId };

    if (!isS3Configured()) {
      if (process.env.VERCEL) {
        return NextResponse.json(
          {
            error:
              "Subida de imágenes no configurada. En Vercel (noteflow2-api) añade AWS_S3_BUCKET, AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY.",
          },
          { status: 503 },
        );
      }

      const apiOrigin = new URL(request.url).origin;
      const urls = createLocalUploadUrls({ ...input, apiOrigin });
      return NextResponse.json(urls);
    }

    const urls = await createPresignedUploadUrl(input);
    const apiOrigin = new URL(request.url).origin;
    return NextResponse.json({
      ...urls,
      publicUrl: buildPublicMediaUrl(apiOrigin, urls.key),
    });
  } catch (error) {
    console.error("[uploads/presign]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
