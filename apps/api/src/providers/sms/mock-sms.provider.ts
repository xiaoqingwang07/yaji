import { Logger } from "@nestjs/common";
import { SmsProvider } from "./sms.provider";

/** 演示用：不发送真实短信，仅记录脱敏日志 */
export class MockSmsProvider implements SmsProvider {
  readonly name = "mock";
  private readonly logger = new Logger(MockSmsProvider.name);
  private readonly codes = new Map<string, { code: string; expiresAt: number }>();

  async sendLoginCode(mobile: string, code: string): Promise<void> {
    const masked = mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    this.codes.set(mobile, { code, expiresAt: Date.now() + 10 * 60_000 });
    this.logger.log(`Mock SMS code stored for ${masked} (not a real send)`);
  }

  peekCode(mobile: string): string | undefined {
    const entry = this.codes.get(mobile);
    if (!entry || entry.expiresAt < Date.now()) return undefined;
    return entry.code;
  }

  consumeCode(mobile: string, code: string): boolean {
    const fixed = process.env.DEV_SMS_CODE;
    if (fixed && code === fixed) return true;
    const entry = this.codes.get(mobile);
    if (!entry || entry.expiresAt < Date.now()) return false;
    if (entry.code !== code) return false;
    this.codes.delete(mobile);
    return true;
  }
}
