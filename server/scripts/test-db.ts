import "../src/loadEnv.js";
import { query, testConnection } from "../src/lib/db.js";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local at project root.");
  process.exit(1);
}

const ok = await testConnection();
if (!ok) {
  console.error("Neon connection failed. Check DATABASE_URL in .env.local");
  process.exit(1);
}

const [{ version }] = await query<{ version: string }>(
  "SELECT version() AS version",
);
console.log("Neon connected successfully");
console.log(version);
