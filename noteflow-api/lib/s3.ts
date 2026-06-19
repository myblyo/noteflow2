import { randomUUID } from "node:crypto";

const region = process.env.AWS_REGION ?? "us-east-1";
const bucket = process.env.AWS_S3_BUCKET;

export function isS3Configured(): boolean {
  return Boolean(bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

function getS3Client() {
  return import("@aws-sdk/client-s3").then(({ S3Client }) =>
    new S3Client({
      region,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    }),
  );
}

export function buildS3Key(input: {
  folder: "avatars" | "notes";
  fileName: string;
  userId: string;
}): string {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${input.folder}/${input.userId}/${randomUUID()}-${safeName}`;
}

export function buildS3PublicUrl(key: string): string {
  const publicBase =
    process.env.AWS_S3_PUBLIC_URL ??
    `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${publicBase}/${key}`;
}

export async function uploadObjectToS3(input: {
  folder: "avatars" | "notes";
  fileName: string;
  contentType: string;
  userId: string;
  body: Buffer | Uint8Array;
}): Promise<{ publicUrl: string; key: string }> {
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET no configurado");
  }

  const key = buildS3Key(input);
  const client = await getS3Client();
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );

  return { publicUrl: buildS3PublicUrl(key), key };
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

  const [{ PutObjectCommand, S3Client }, { getSignedUrl }] = await Promise.all([
    import("@aws-sdk/client-s3"),
    import("@aws-sdk/s3-request-presigner"),
  ]);

  const client = new S3Client({
    region,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  const key = buildS3Key(input);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

  return {
    uploadUrl,
    publicUrl: buildS3PublicUrl(key),
    key,
  };
}

export async function getObjectFromS3(key: string): Promise<{
  body: Buffer;
  contentType: string | undefined;
}> {
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET no configurado");
  }

  const client = await getS3Client();
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  const bytes = await response.Body?.transformToByteArray();
  if (!bytes) {
    throw new Error("Objeto S3 vacío");
  }

  return {
    body: Buffer.from(bytes),
    contentType: response.ContentType,
  };
}
