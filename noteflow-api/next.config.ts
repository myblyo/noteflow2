import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

const repoRoot = path.join(__dirname, "..");

// Asegura DATABASE_URL antes del build/dev (monorepo: .env.local en la raíz)
loadDotenv({ path: path.join(repoRoot, ".env.local") });
loadDotenv({ path: path.join(repoRoot, ".env") });
loadDotenv({ path: path.join(__dirname, ".env.local"), override: true });
loadEnvConfig(repoRoot);

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
