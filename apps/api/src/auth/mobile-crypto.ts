import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";

function encryptionKey(): Buffer {
  const raw = process.env.MOBILE_ENCRYPTION_KEY || process.env.JWT_ACCESS_SECRET || "dev-only-mobile-key";
  return createHash("sha256").update(raw).digest();
}

export function hashMobile(mobile: string): string {
  const pepper = process.env.MOBILE_HASH_PEPPER || "yaji-dev-pepper";
  return createHash("sha256").update(`${pepper}:${mobile}`).digest("hex");
}

export function encryptMobile(mobile: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(mobile, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptMobile(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("invalid mobile payload");
  const decipher = createDecipheriv(ALGO, encryptionKey(), Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function maskMobile(mobile: string): string {
  return mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}
