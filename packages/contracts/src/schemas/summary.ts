import { z } from "zod";
import { isoDateSchema } from "./common";

export const createStageSummarySchema = z
  .object({
    rangePreset: z
      .enum(["LAST_1M", "LAST_3M", "LAST_6M", "WHOLE_PREGNANCY", "SINCE_BIRTH", "CUSTOM"])
      .optional(),
    rangeFrom: isoDateSchema.optional(),
    rangeTo: isoDateSchema.optional(),
  })
  .refine(
    (v) =>
      Boolean(v.rangePreset && v.rangePreset !== "CUSTOM") ||
      Boolean(v.rangeFrom && v.rangeTo),
    { message: "须指定范围预设或起止日期" },
  );
