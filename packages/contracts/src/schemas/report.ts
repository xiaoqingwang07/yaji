import { z } from "zod";
import { ReportCategory } from "../enums";

export const createReportSchema = z.object({
  attachmentIds: z.array(z.string().uuid()).min(1).max(20),
  subject: z.enum(["MOTHER", "BABY"]),
  motherProfileId: z.string().uuid().optional(),
  babyId: z.string().uuid().optional(),
});

export const reportFieldDraftSchema = z.object({
  id: z.string().uuid().optional(),
  section: z.string().optional(),
  label: z.string().min(1),
  value: z.string().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  sourceFlag: z.string().optional(),
  fieldType: z.enum(["KEY_VALUE", "MEASUREMENT", "TEXT", "TABLE_CELL"]),
  confidence: z.number().min(0).max(1).optional(),
  pageNumber: z.number().int().optional(),
  verifiedByUser: z.boolean().optional(),
  syncToHealth: z.boolean().optional(),
});

export const confirmReportSchema = z.object({
  title: z.string().min(1).max(120),
  category: z.nativeEnum(ReportCategory),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  institution: z.string().max(120).optional(),
  conclusion: z.string().max(4000).optional(),
  subject: z.enum(["MOTHER", "BABY"]),
  eventType: z.string(),
  fields: z.array(reportFieldDraftSchema),
  syncHealthFieldIds: z.array(z.string()).default([]),
});
