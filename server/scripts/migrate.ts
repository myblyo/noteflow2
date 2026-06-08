import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../src/loadEnv.js";
import { query } from "../src/lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "../sql/schema.sql");

const schema = await fs.readFile(schemaPath, "utf-8");
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  try {
    await query(statement);
    console.log("OK:", statement.split("\n")[0]);
  } catch (error) {
    const code = (error as { code?: string }).code;
    const skip =
      (code === "42P07" && statement.includes("RENAME TO checklist_items")) ||
      (code === "42P01" && statement.includes("RENAME TO checklist_items"));
    if (skip) {
      console.log("SKIP:", statement.split("\n")[0]);
      continue;
    }
    throw error;
  }
}

console.log("Schema applied to Neon.");
