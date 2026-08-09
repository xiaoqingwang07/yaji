import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { notFound } from "../common/errors";

type KnowledgeJson = {
  id: string;
  category: "TERM" | "CALENDAR_ITEM" | "CHECKLIST_ITEM";
  title: string;
  plainText: string;
  stage?: string | null;
  gestationalWeekFrom?: number | null;
  gestationalWeekTo?: number | null;
  babyMonthAge?: number | null;
  checklistKind?: "MEDICAL" | "DOCUMENT" | null;
  sourceNote: string;
  version: number;
};

@Injectable()
export class KnowledgeService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.syncFromFixtures();
    } catch (err) {
      this.logger.warn(
        `Knowledge sync skipped: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async syncFromFixtures() {
    const root = path.resolve(process.cwd(), "../../fixtures/knowledge");
    const files = ["terms.json", "calendar.json", "checklists.json"];
    const entries: KnowledgeJson[] = [];
    for (const file of files) {
      const raw = await readFile(path.join(root, file), "utf8");
      entries.push(...(JSON.parse(raw) as KnowledgeJson[]));
    }

    for (const entry of entries) {
      await this.prisma.knowledgeEntry.upsert({
        where: { id: entry.id },
        create: {
          id: entry.id,
          category: entry.category,
          title: entry.title,
          plainText: entry.plainText,
          stage: (entry.stage as never) ?? null,
          gestationalWeekFrom: entry.gestationalWeekFrom ?? null,
          gestationalWeekTo: entry.gestationalWeekTo ?? null,
          babyMonthAge: entry.babyMonthAge ?? null,
          checklistKind: (entry.checklistKind as never) ?? null,
          sourceNote: entry.sourceNote,
          version: entry.version,
        },
        update: {
          category: entry.category,
          title: entry.title,
          plainText: entry.plainText,
          stage: (entry.stage as never) ?? null,
          gestationalWeekFrom: entry.gestationalWeekFrom ?? null,
          gestationalWeekTo: entry.gestationalWeekTo ?? null,
          babyMonthAge: entry.babyMonthAge ?? null,
          checklistKind: (entry.checklistKind as never) ?? null,
          sourceNote: entry.sourceNote,
          version: entry.version,
        },
      });
    }
    this.logger.log(`Knowledge entries synced: ${entries.length}`);
    return entries.length;
  }

  async getEntry(entryId: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw notFound("知识库条目不存在");
    return entry;
  }

  async listHints(limit = 20) {
    return this.prisma.knowledgeEntry.findMany({
      where: { category: "TERM" },
      take: limit,
      orderBy: { id: "asc" },
    });
  }
}
