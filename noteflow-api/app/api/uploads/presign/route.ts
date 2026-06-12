import { NextResponse } from "next/server";
import { z } from "zod";
import { createLocalUploadUrls } from "@/lib/local-upload";
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
      const apiOrigin = new URL(request.url).origin;
      const urls = createLocalUploadUrls({ ...input, apiOrigin });
      return NextResponse.json(urls);
    }

    const urls = await createPresignedUploadUrl(input);
    return NextResponse.json(urls);
  } catch (error) {
    console.error("[uploads/presign]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
