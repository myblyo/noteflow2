import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { readDb, writeDb, nowIso } from "../store/fileStore.js";

const router = Router();

const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(""),
  isFavorite: z.boolean().optional(),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const db = await readDb();
    res.json(db.notes);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const note = db.notes.find((n) => n.id === req.params.id);
    if (!note) throw new HttpError(404, "Note not found");
    res.json(note);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createNoteSchema.parse(req.body);
    const db = await readDb();
    const timestamp = nowIso();
    const note = {
      id: randomUUID(),
      title: body.title,
      content: body.content,
      isFavorite: body.isFavorite ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    db.notes.unshift(note);
    await writeDb(db);
    res.status(201).json(note);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const body = updateNoteSchema.parse(req.body);
    const db = await readDb();
    const index = db.notes.findIndex((n) => n.id === req.params.id);
    if (index === -1) throw new HttpError(404, "Note not found");

    db.notes[index] = {
      ...db.notes[index],
      ...body,
      updatedAt: nowIso(),
    };
    await writeDb(db);
    res.json(db.notes[index]);
  }),
);

router.patch(
  "/:id/favorite",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const note = db.notes.find((n) => n.id === req.params.id);
    if (!note) throw new HttpError(404, "Note not found");

    note.isFavorite = !note.isFavorite;
    note.updatedAt = nowIso();
    await writeDb(db);
    res.json(note);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await readDb();
    const before = db.notes.length;
    db.notes = db.notes.filter((n) => n.id !== req.params.id);
    if (db.notes.length === before) throw new HttpError(404, "Note not found");
    await writeDb(db);
    res.status(204).send();
  }),
);

export default router;
