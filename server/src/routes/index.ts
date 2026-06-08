import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { readDb } from "../store/fileStore.js";
import { testConnection } from "../lib/db.js";
import notesRouter from "./notes.js";
import ideasRouter from "./ideas.js";
import checklistsRouter from "./checklists.js";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const dbConnected = process.env.DATABASE_URL
      ? await testConnection()
      : false;

    res.json({
      status: "ok",
      service: "noteflow-api",
      database: dbConnected ? "connected" : "disconnected",
    });
  }),
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const db = await readDb();
    res.json({
      notes: db.notes,
      ideas: db.ideas,
      checklists: db.checklists,
      ideaColorLabels: db.ideaColorLabels,
    });
  }),
);

router.use("/notes", notesRouter);
router.use("/ideas", ideasRouter);
router.use("/checklists", checklistsRouter);

export default router;
