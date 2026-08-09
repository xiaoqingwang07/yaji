import { z } from "zod";
import { FamilyRelation, InviteFacingRole, OnboardingPhase } from "../enums";
import { isoDateSchema } from "./common";

export const createFamilySchema = z.object({
  name: z.string().min(1).max(40).optional(),
  motherDisplayName: z.string().min(1).max(40).optional(),
  relationToMother: z.nativeEnum(FamilyRelation).default(FamilyRelation.MOTHER),
});

/** 极简建档：阶段 + 一个日期（备孕可无日期） */
export const onboardFamilySchema = z
  .object({
    phase: z.nativeEnum(OnboardingPhase),
    relationToMother: z.nativeEnum(FamilyRelation).default(FamilyRelation.MOTHER),
    familyName: z.string().min(1).max(40).optional(),
    motherDisplayName: z.string().min(1).max(40).optional(),
    planningStartedAt: isoDateSchema.optional(),
    dueDate: isoDateSchema.optional(),
    lastMenstrualDate: isoDateSchema.optional(),
    babyBirthDate: isoDateSchema.optional(),
    babyNickname: z.string().min(1).max(40).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.phase === OnboardingPhase.PREGNANCY && !v.dueDate && !v.lastMenstrualDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "预产期和末次月经至少填写一个",
        path: ["dueDate"],
      });
    }
    if (v.phase === OnboardingPhase.BORN && !v.babyBirthDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "宝宝出生日期必填",
        path: ["babyBirthDate"],
      });
    }
  });

export const createInviteSchema = z.object({
  relation: z.nativeEnum(FamilyRelation).default(FamilyRelation.FATHER),
  /** 客户端只暴露可查看 / 可编辑 */
  role: z.nativeEnum(InviteFacingRole),
});

export const updateMemberSchema = z.object({
  relation: z.nativeEnum(FamilyRelation).optional(),
});

export const createPregnancySchema = z
  .object({
    lastMenstrualDate: isoDateSchema.optional(),
    dueDate: isoDateSchema.optional(),
    status: z.enum(["PLANNING", "PREGNANT"]).optional(),
    notes: z.string().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.status !== "PLANNING" && !v.lastMenstrualDate && !v.dueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "怀孕中须填写末次月经或预产期",
        path: ["dueDate"],
      });
    }
  });

export const createBabySchema = z.object({
  nickname: z.string().min(1).max(40).optional(),
  birthDate: isoDateSchema,
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  pregnancyId: z.string().uuid().optional(),
});
