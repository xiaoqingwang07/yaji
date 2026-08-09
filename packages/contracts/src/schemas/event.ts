import { z } from "zod";
import { EventStage, EventType } from "../enums";
import { isoDateTimeSchema } from "./common";

export const createEventSchema = z.object({
  type: z.nativeEnum(EventType),
  stage: z.nativeEnum(EventStage),
  title: z.string().min(1).max(80),
  occurredAt: isoDateTimeSchema,
  location: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
  costAmount: z.number().nonnegative().max(1_000_000).optional(),
  costNote: z.string().max(200).optional(),
  motherProfileId: z.string().uuid().optional(),
  babyId: z.string().uuid().optional(),
  pregnancyId: z.string().uuid().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventFilterSchema = z.object({
  subject: z.enum(["ALL", "MOTHER", "BABY"]).optional(),
  stage: z.nativeEnum(EventStage).optional(),
  type: z.nativeEnum(EventType).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().max(100).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
