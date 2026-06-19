import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(path.join(__dirname, ".."));

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
