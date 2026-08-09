import { z } from "zod";
import { MeasurementSource } from "../enums";
import { isoDateTimeSchema } from "./common";

export const createMotherHealthSchema = z.object({
  stage: z.enum(["PREGNANCY", "POSTPARTUM"]),
  recordType: z.enum(["MEASUREMENT", "SYMPTOM", "CHECKUP"]),
  recordedAt: isoDateTimeSchema,
  measurementSource: z.nativeEnum(MeasurementSource).default(MeasurementSource.MANUAL),
  weightValue: z.number().positive().optional(),
  weightUnit: z.enum(["kg", "jin"]).optional(),
  systolic: z.number().int().positive().optional(),
  diastolic: z.number().int().positive().optional(),
  bloodGlucoseValue: z.number().positive().optional(),
  bloodGlucoseUnit: z.string().optional(),
  fetalMovementCount: z.number().int().nonnegative().optional(),
  fetalHeartRate: z.number().int().positive().max(250).optional(),
  temperatureValue: z.number().positive().optional(),
  temperatureUnit: z.enum(["C", "F"]).optional(),
  symptoms: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const createBabyGrowthSchema = z.object({
  recordType: z.enum(["BIRTH", "MEASUREMENT", "CHECKUP", "MILESTONE"]),
  recordedAt: isoDateTimeSchema,
  weightValue: z.number().positive().optional(),
  weightUnit: z.enum(["kg", "g"]).optional(),
  heightValue: z.number().positive().optional(),
  heightUnit: z.enum(["cm"]).optional(),
  headCircumferenceValue: z.number().positive().optional(),
  headCircumferenceUnit: z.enum(["cm"]).optional(),
  milestoneType: z.string().max(80).optional(),
  notes: z.string().max(1000).optional(),
});

export const createVaccinationSchema = z.object({
  vaccineName: z.string().min(1).max(80),
  doseNumber: z.number().int().positive().optional(),
  vaccinatedAt: isoDateTimeSchema,
  institution: z.string().max(120).optional(),
  batchNumber: z.string().max(80).optional(),
  nextDueAt: isoDateTimeSchema.optional(),
  notes: z.string().max(1000).optional(),
});
