import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { readDb, writeDb, nowIso } from "../store/fileStore.js";

const router = Router();

const createIdeaSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  color: z.string().default("#6366F1"),
  isFavorite: z.boolean().optional(),
});

const updateIdeaSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const db = await readDb();
    res.json(db.ideas);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const idea = db.ideas.find((i) => i.id === req.params.id);
    if (!idea) throw new HttpError(404, "Idea not found");
    res.json(idea);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createIdeaSchema.parse(req.body);
    const db = await readDb();
    const timestamp = nowIso();
    const idea = {
      id: randomUUID(),
      title: body.title,
      description: body.description,
      tags: body.tags,
      color: body.color,
      isFavorite: body.isFavorite ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    db.ideas.unshift(idea);
    await writeDb(db);
    res.status(201).json(idea);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const body = updateIdeaSchema.parse(req.body);
    const db = await readDb();
    const index = db.ideas.findIndex((i) => i.id === req.params.id);
    if (index === -1) throw new HttpError(404, "Idea not found");

    db.ideas[index] = {
      ...db.ideas[index],
      ...body,
      updatedAt: nowIso(),
    };
    await writeDb(db);
    res.json(db.ideas[index]);
  }),
);

router.patch(
  "/:id/favorite",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const idea = db.ideas.find((i) => i.id === req.params.id);
    if (!idea) throw new HttpError(404, "Idea not found");

    idea.isFavorite = !idea.isFavorite;
    idea.updatedAt = nowIso();
    await writeDb(db);
    res.json(idea);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const before = db.ideas.length;
    db.ideas = db.ideas.filter((i) => i.id !== req.params.id);
    if (db.ideas.length === before) throw new HttpError(404, "Idea not found");
    await writeDb(db);
    res.status(204).send();
  }),
);

export default router;
