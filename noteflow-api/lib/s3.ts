import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION ?? "us-east-1";
const bucket = process.env.AWS_S3_BUCKET;

function getClient() {
  return new S3Client({
    region,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

export function isS3Configured(): boolean {
  return Boolean(bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

export async function createPresignedUploadUrl(input: {
  folder: "avatars" | "notes";
  fileName: string;
  contentType: string;
  userId: string;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET no configurado");
  }

  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${input.folder}/${input.userId}/${randomUUID()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 300 });

  const publicBase =
    process.env.AWS_S3_PUBLIC_URL ??
    `https://${bucket}.s3.${region}.amazonaws.com`;

  return {
    uploadUrl,
    publicUrl: `${publicBase}/${key}`,
    key,
  };
}
