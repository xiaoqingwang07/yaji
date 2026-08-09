import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    let db: "up" | "down" = "down";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = "up";
    } catch {
      db = "down";
    }
    return {
      ok: db === "up",
      service: "yaji-api",
      stage: "step2-foundation",
      db,
      providers: {
        sms: process.env.SMS_PROVIDER || "mock",
        ocr: process.env.OCR_PROVIDER || "mock",
        llm: process.env.LLM_PROVIDER || "mock",
        asr: process.env.ASR_PROVIDER || "mock",
      },
    };
  }
}
