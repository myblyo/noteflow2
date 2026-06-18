import { z } from "zod";
import { documentIsEmpty, parseNoteContent } from "../utils/noteDocument";

export const noteSchema = z.object({
    title: z.string().min(1, "El título es obligatorio"),
    content: z.string().refine((value) => !documentIsEmpty(parseNoteContent(value)), {
        message: "El contenido es obligatorio",
    }),
});

export const ideaSchema = z.object({
    title: z.string().min(1, "El título es obligatorio"),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    color: z.string().optional(),
});

export const checklistSchema = z.object({
    title: z.string().min(1, "El título es obligatorio"),
    items: z.array(
        z.object({
            task: z.string().min(1, "La tarea es obligatoria"),
            isCompleted: z.boolean().default(false),
        })
    ).optional(),
}).strict();

export const AnyNoteSchema = z.discriminatedUnion("type", [
    noteSchema.extend({ type: z.literal("note") }),
    ideaSchema.extend({ type: z.literal("idea") }),
    checklistSchema.extend({ type: z.literal("checklist") }),
]);

export type NoteData = z.infer<typeof noteSchema>;
export type IdeaData = z.infer<typeof ideaSchema>;
export type ChecklistData = z.infer<typeof checklistSchema>;
export type AnyNoteData = z.infer<typeof AnyNoteSchema>;