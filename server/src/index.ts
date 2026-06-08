import "./loadEnv.js";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8082";

const app = createApp(CORS_ORIGIN);

app.listen(PORT, () => {
  console.log(`Noteflow API running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
