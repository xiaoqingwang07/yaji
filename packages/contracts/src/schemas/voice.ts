import { z } from "zod";
import { isoDateTimeSchema } from "./common";

export const createVisitRecordingSchema = z.object({
  source: z.enum(["IN_APP", "IMPORTED"]).default("IN_APP"),
  recordedAt: isoDateTimeSchema.optional(),
  durationSeconds: z.number().int().positive().max(3600).optional(),
  motherProfileId: z.string().uuid().optional(),
  babyId: z.string().uuid().optional(),
  pregnancyId: z.string().uuid().optional(),
  originalFileName: z.string().min(1).max(200),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
});

export const visitRecordingDraftSchema = z.object({
  doctorNotes: z.array(z.string().min(1).max(500)).default([]),
  medications: z.array(z.string().min(1).max(200)).default([]),
  nextVisit: z.array(z.string().min(1).max(200)).default([]),
  transcript: z.string().max(50_000).optional(),
});

export const confirmVisitRecordingSchema = visitRecordingDraftSchema.extend({
  createReminders: z.boolean().default(false),
  addToBringList: z.boolean().default(false),
});
