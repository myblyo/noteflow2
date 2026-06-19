import path from "node:path";
import { config } from "dotenv";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), "../.env.local") });

let sql: NeonQueryFunction<false, false> | null = null;

function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables.",
      );
    }
    sql = neon(url);
  }
  return sql;
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const client = getSql();
  const result = params ? await client.query(text, params) : await client.query(text);
  return result as T[];
}
