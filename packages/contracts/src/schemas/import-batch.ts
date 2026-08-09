import { z } from "zod";
import { ReportCategory } from "../enums";
import { isoDateSchema } from "./common";

export const createImportBatchSchema = z.object({
  /** 首次创建时可同时带上附件数量占位 */
  expectedCount: z.number().int().min(1).max(50).optional(),
});

export const appendImportBatchReportsSchema = z.object({
  attachmentIds: z.array(z.string().uuid()).min(1).max(20),
});

export const confirmImportBatchItemSchema = z.object({
  reportId: z.string().uuid(),
  title: z.string().min(1).max(120).optional(),
  reportDate: isoDateSchema.optional(),
  institution: z.string().max(120).optional(),
  category: z.nativeEnum(ReportCategory).default(ReportCategory.OTHER),
});
