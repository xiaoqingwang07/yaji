import { z } from "zod";
import { ReminderType } from "../enums";
import { isoDateTimeSchema } from "./common";

export const createReminderSchema = z.object({
  type: z.nativeEnum(ReminderType),
  title: z.string().min(1).max(80),
  scheduledAt: isoDateTimeSchema,
  relatedEventId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
  motherProfileId: z.string().uuid().optional(),
  babyId: z.string().uuid().optional(),
});

export const updateReminderSchema = createReminderSchema.partial().extend({
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
});
