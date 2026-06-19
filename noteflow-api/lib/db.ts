import "./load-env";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;
let schemaEnsured: Promise<void> | null = null;

const PLACEHOLDER_HOSTS = new Set(["host", "HOST", "your-host", "YOUR-HOST"]);

function parseDatabaseHost(url: string): string | null {
  const match = url.match(/@([^/:?]+)/);
  return match?.[1] ?? null;
}

function assertValidDatabaseUrl(url: string) {
  const host = parseDatabaseHost(url);
  if (!host || PLACEHOLDER_HOSTS.has(host)) {
    throw new Error(
      "DATABASE_URL no es válida: sigue con el placeholder @HOST de la documentación. " +
        "Copia la connection string real desde Neon (console.neon.tech → tu proyecto → Connect) " +
        "y pégala en .env.local (raíz del repo). " +
        "En Vercel, actualiza la variable en el proyecto noteflow-api.",
    );
  }
}

function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it in .env.local (repo root) or Vercel → Environment Variables.",
      );
    }
    assertValidDatabaseUrl(url);
    sql = neon(url);
  }
  return sql;
}

const SCHEMA_PATCHES = [
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT ''",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT",
  "ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID",
  "ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false",
];

async function ensureDbSchema() {
  if (!schemaEnsured) {
    schemaEnsured = (async () => {
      const client = getSql();
      for (const statement of SCHEMA_PATCHES) {
        await client.query(statement);
      }
    })().catch((error) => {
      schemaEnsured = null;
      throw error;
    });
  }
  await schemaEnsured;
}

export function formatDbError(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes("DATABASE_URL") ||
      error.message.includes("relation") ||
      error.message.includes("does not exist")
    ) {
      return error.message;
    }
  }
  return "Error interno";
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  await ensureDbSchema();
  const client = getSql();
  const result = params
    ? await client.query(text, params)
    : await client.query(text);
  return result as T[];
}
