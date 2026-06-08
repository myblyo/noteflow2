import path from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), "../.env.local") });

const sql = neon(process.env.DATABASE_URL!);

export async function query<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = params
    ? await sql.query(text, params)
    : await sql.query(text);
  return result as T[];
}
