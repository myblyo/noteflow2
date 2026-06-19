import "./load-env";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

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

function normalizeDatabaseUrl(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.delete("channel_binding");
  return parsed.toString();
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
    sql = neon(normalizeDatabaseUrl(url));
  }
  return sql;
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
  const client = getSql();
  const result = params
    ? await client.query(text, params)
    : await client.query(text);
  return result as T[];
}
