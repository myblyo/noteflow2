import { NextResponse } from "next/server";
import {
  guessImageContentType,
  isValidUploadKey,
  readLocalUpload,
} from "@/lib/local-upload";
import { getObjectFromS3, isS3Configured } from "@/lib/s3";

/** Sirve imágenes de S3 o almacenamiento local sin bucket público. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: segments } = await context.params;
    const key = segments.map((segment) => decodeURIComponent(segment)).join("/");

    if (!isValidUploadKey(key)) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    let body: Buffer;
    let contentType: string;

    if (isS3Configured()) {
      const object = await getObjectFromS3(key);
      body = object.body;
      contentType = object.contentType ?? guessImageContentType(key);
    } else {
      body = await readLocalUpload(key);
      contentType = guessImageContentType(key);
    }

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    const status = message.includes("ENOENT") ? 404 : 500;
    if (status === 500) {
      console.error("[media GET]", error);
    }
    return NextResponse.json({ error: "No encontrado" }, { status });
  }
}
