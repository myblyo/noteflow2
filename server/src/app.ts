import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(corsOrigin: string) {
  const app = express();

  app.use(
    cors({
      origin: corsOrigin.split(",").map((o) => o.trim()),
    }),
  );
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      message: "Noteflow API",
      docs: "/api/health",
    });
  });

  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
}
