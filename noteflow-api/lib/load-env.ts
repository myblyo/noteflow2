import path from "node:path";
import { config } from "dotenv";

function resolveEnvPaths() {
  const cwd = process.cwd();
  const isApiRoot = cwd.replace(/\\/g, "/").endsWith("/noteflow-api");
  const apiRoot = isApiRoot ? cwd : path.join(cwd, "noteflow-api");
  const repoRoot = isApiRoot ? path.resolve(cwd, "..") : cwd;
  return { apiRoot, repoRoot };
}

/** Carga .env.local del monorepo (raíz) y overrides de noteflow-api/. */
export function loadEnvFiles() {
  const { apiRoot, repoRoot } = resolveEnvPaths();

  config({ path: path.join(repoRoot, ".env.local") });
  config({ path: path.join(repoRoot, ".env") });
  config({ path: path.join(apiRoot, ".env.local"), override: true });
  config({ path: path.join(apiRoot, ".env"), override: true });
}

loadEnvFiles();
