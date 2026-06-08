import { neon } from "@neondatabase/serverless";

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

export async function testConnection(): Promise<boolean> {
  try {
    await query("SELECT 1 AS ok");
    return true;
  } catch {
    return false;
  }
}
