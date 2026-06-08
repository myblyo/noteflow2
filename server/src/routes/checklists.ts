import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { readDb, writeDb, nowIso } from "../store/fileStore.js";

const router = Router();

const checklistItemSchema = z.object({
  id: z.string().optional(),
  task: z.string().min(1),
  isCompleted: z.boolean().default(false),
});

const createChecklistSchema = z.object({
  title: z.string().min(1),
  items: z.array(checklistItemSchema).default([]),
  isFavorite: z.boolean().optional(),
});

const updateChecklistSchema = z.object({
  title: z.string().min(1).optional(),
  items: z.array(checklistItemSchema).optional(),
  isFavorite: z.boolean().optional(),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const db = await readDb();
    res.json(db.checklists);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const checklist = db.checklists.find((c) => c.id === req.params.id);
    if (!checklist) throw new HttpError(404, "Checklist not found");
    res.json(checklist);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createChecklistSchema.parse(req.body);
    const db = await readDb();
    const timestamp = nowIso();
    const checklist = {
      id: randomUUID(),
      title: body.title,
      items: body.items.map((item) => ({
        id: item.id ?? randomUUID(),
        task: item.task,
        isCompleted: item.isCompleted,
      })),
      isFavorite: body.isFavorite ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    db.checklists.unshift(checklist);
    await writeDb(db);
    res.status(201).json(checklist);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const body = updateChecklistSchema.parse(req.body);
    const db = await readDb();
    const index = db.checklists.findIndex((c) => c.id === req.params.id);
    if (index === -1) throw new HttpError(404, "Checklist not found");

    const current = db.checklists[index];
    db.checklists[index] = {
      ...current,
      ...body,
      items: body.items
        ? body.items.map((item) => ({
            id: item.id ?? randomUUID(),
            task: item.task,
            isCompleted: item.isCompleted,
          }))
        : current.items,
      updatedAt: nowIso(),
    };
    await writeDb(db);
    res.json(db.checklists[index]);
  }),
);

router.patch(
  "/:id/favorite",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const checklist = db.checklists.find((c) => c.id === req.params.id);
    if (!checklist) throw new HttpError(404, "Checklist not found");

    checklist.isFavorite = !checklist.isFavorite;
    checklist.updatedAt = nowIso();
    await writeDb(db);
    res.json(checklist);
  }),
);

router.patch(
  "/:id/items/:itemId/toggle",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const checklist = db.checklists.find((c) => c.id === req.params.id);
    if (!checklist) throw new HttpError(404, "Checklist not found");

    const item = checklist.items.find((i) => i.id === req.params.itemId);
    if (!item) throw new HttpError(404, "Checklist item not found");

    item.isCompleted = !item.isCompleted;
    checklist.updatedAt = nowIso();
    await writeDb(db);
    res.json(checklist);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const before = db.checklists.length;
    db.checklists = db.checklists.filter((c) => c.id !== req.params.id);
    if (db.checklists.length === before) throw new HttpError(404, "Checklist not found");
    await writeDb(db);
    res.status(204).send();
  }),
);

export default router;
