import { z } from "zod";

export const requestCodeSchema = z.object({
  mobile: z.string().regex(/^1\d{10}$/, "请输入有效手机号"),
});

export const verifyCodeSchema = z.object({
  mobile: z.string().regex(/^1\d{10}$/),
  code: z.string().length(6),
  agreeTerms: z.literal(true),
});

export const devLoginSchema = z.object({
  displayName: z.string().min(1).max(40).optional(),
});

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().nullable(),
  maskedMobile: z.string(),
  status: z.enum(["ACTIVE", "DISABLED", "PENDING_DELETION"]),
});
