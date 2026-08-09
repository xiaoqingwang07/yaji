import { Injectable } from "@nestjs/common";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { PrismaService } from "../prisma/prisma.service";
import { MockSmsProvider } from "../providers/sms/mock-sms.provider";
import { AppError, forbidden, unauthorized } from "../common/errors";
import { encryptMobile, hashMobile, maskMobile, decryptMobile } from "./mobile-crypto";

const ACCESS_TTL_SEC = 60 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: MockSmsProvider,
  ) {}

  private accessSecret() {
    return new TextEncoder().encode(
      process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
    );
  }

  private refreshSecret() {
    return new TextEncoder().encode(
      process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
    );
  }

  async requestCode(mobile: string) {
    if (process.env.NODE_ENV === "production" && process.env.SMS_PROVIDER === "mock") {
      throw forbidden("生产环境禁止使用 Mock 短信");
    }
    const code =
      process.env.DEV_SMS_CODE ||
      String(randomInt(100000, 999999));
    await this.sms.sendLoginCode(mobile, code);
    return {
      sent: true,
      maskedMobile: maskMobile(mobile),
      demoHint:
        process.env.SMS_PROVIDER === "mock" || !process.env.SMS_PROVIDER
          ? "演示模式：使用 DEV_SMS_CODE 或日志中的验证码"
          : undefined,
    };
  }

  async verifyCode(input: { mobile: string; code: string; agreeTerms: true }) {
    if (!this.sms.consumeCode(input.mobile, input.code)) {
      throw new AppError("INVALID_CODE", "验证码错误或已过期", 401);
    }
    return this.issueForMobile(input.mobile);
  }

  async devLogin(displayName?: string) {
    if (process.env.NODE_ENV === "production") {
      throw forbidden("生产环境禁止开发登录");
    }
    const mobile = "19900001001";
    const tokens = await this.issueForMobile(mobile, displayName ?? "演示用户");
    return tokens;
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; typ?: string };
    try {
      const verified = await jwtVerify(refreshToken, this.refreshSecret());
      payload = verified.payload as { sub: string; typ?: string };
    } catch {
      throw unauthorized("刷新令牌无效");
    }
    if (payload.typ !== "refresh") throw unauthorized("刷新令牌无效");

    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw unauthorized("刷新令牌已失效");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== "ACTIVE") throw unauthorized();
    return this.issueTokens(user.id);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return { ok: true };
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw unauthorized();
    let maskedMobile = "****";
    try {
      maskedMobile = maskMobile(decryptMobile(user.mobileEncrypted));
    } catch {
      maskedMobile = "****";
    }
    return {
      id: user.id,
      displayName: user.displayName,
      maskedMobile,
      status: user.status,
    };
  }

  async updateMe(userId: string, displayName?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { displayName },
    });
    return this.getMe(user.id);
  }

  async verifyAccessToken(token: string): Promise<string> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret());
      if (payload.typ !== "access" || typeof payload.sub !== "string") {
        throw unauthorized();
      }
      return payload.sub;
    } catch {
      throw unauthorized();
    }
  }

  private async issueForMobile(mobile: string, displayName?: string) {
    const mobileHash = hashMobile(mobile);
    let user = await this.prisma.user.findUnique({ where: { mobileHash } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          mobileHash,
          mobileEncrypted: encryptMobile(mobile),
          displayName: displayName ?? null,
          lastLoginAt: new Date(),
          consents: {
            create: {
              consentType: "TERMS_PRIVACY",
              documentVersion: "2026-08-09",
              grantedAt: new Date(),
            },
          },
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          ...(displayName ? { displayName } : {}),
        },
      });
    }
    const tokens = await this.issueTokens(user.id);
    return {
      ...tokens,
      user: await this.getMe(user.id),
    };
  }

  private async issueTokens(userId: string) {
    const accessToken = await new SignJWT({ typ: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TTL_SEC}s`)
      .setJti(randomUUID())
      .sign(this.accessSecret());

    const refreshToken = await new SignJWT({ typ: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime("30d")
      .setJti(randomUUID())
      .sign(this.refreshSecret());

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TTL_SEC,
    };
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
