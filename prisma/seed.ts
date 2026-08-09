/**
 * 脱敏种子数据。禁止写入真实手机号或真实医疗报告。
 */
import { PrismaClient, EventStage, PregnancyStatus, MemberRole, FamilyRelation } from "@prisma/client";
import { createHash, createCipheriv, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

function hashMobile(mobile: string): string {
  const pepper = process.env.MOBILE_HASH_PEPPER || "yaji-dev-pepper";
  return createHash("sha256").update(`${pepper}:${mobile}`).digest("hex");
}

function encryptMobile(mobile: string): string {
  const raw = process.env.MOBILE_ENCRYPTION_KEY || process.env.JWT_ACCESS_SECRET || "dev-only-mobile-key";
  const key = createHash("sha256").update(raw).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(mobile, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

async function loadKnowledge() {
  const root = path.resolve(__dirname, "../fixtures/knowledge");
  const files = ["terms.json", "calendar.json", "checklists.json"];
  for (const file of files) {
    const entries = JSON.parse(await readFile(path.join(root, file), "utf8")) as Array<{
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
    }>;
    for (const entry of entries) {
      await prisma.knowledgeEntry.upsert({
        where: { id: entry.id },
        create: {
          id: entry.id,
          category: entry.category,
          title: entry.title,
          plainText: entry.plainText,
          stage: (entry.stage as EventStage | null) ?? null,
          gestationalWeekFrom: entry.gestationalWeekFrom ?? null,
          gestationalWeekTo: entry.gestationalWeekTo ?? null,
          babyMonthAge: entry.babyMonthAge ?? null,
          checklistKind: (entry.checklistKind as "MEDICAL" | "DOCUMENT" | null) ?? null,
          sourceNote: entry.sourceNote,
          version: entry.version,
        },
        update: {
          title: entry.title,
          plainText: entry.plainText,
          sourceNote: entry.sourceNote,
          version: entry.version,
        },
      });
    }
  }
}

async function main() {
  await loadKnowledge();

  // 演示号：19900001001（非真实手机号）
  const demoMobile = "19900001001";
  const mobileHash = hashMobile(demoMobile);

  const user = await prisma.user.upsert({
    where: { mobileHash },
    create: {
      mobileHash,
      mobileEncrypted: encryptMobile(demoMobile),
      displayName: "演示用户",
      lastLoginAt: new Date(),
    },
    update: { displayName: "演示用户" },
  });

  let family = await prisma.family.findFirst({
    where: { createdByUserId: user.id, deletedAt: null },
  });

  if (!family) {
    family = await prisma.family.create({
      data: {
        name: "演示孕育家庭",
        createdByUserId: user.id,
        members: {
          create: {
            userId: user.id,
            relation: FamilyRelation.MOTHER,
            role: MemberRole.OWNER,
          },
        },
        motherProfiles: {
          create: { displayName: "演示妈妈", linkedUserId: user.id },
        },
      },
    });

    const mother = await prisma.motherProfile.findFirstOrThrow({
      where: { familyId: family.id },
    });

    const pregnancy = await prisma.pregnancy.create({
      data: {
        familyId: family.id,
        motherProfileId: mother.id,
        status: PregnancyStatus.PREGNANT,
        dueDate: new Date("2026-12-01"),
        lastMenstrualDate: new Date("2026-02-24"),
      },
    });

    await prisma.family.update({
      where: { id: family.id },
      data: { activePregnancyId: pregnancy.id },
    });

    await prisma.event.create({
      data: {
        familyId: family.id,
        pregnancyId: pregnancy.id,
        motherProfileId: mother.id,
        stage: EventStage.PREGNANCY,
        type: "PRENATAL_CHECK",
        title: "建档产检（种子数据）",
        occurredAt: new Date("2026-05-10T09:00:00+08:00"),
        location: "示例妇幼保健院",
        notes: "脱敏演示事件，非真实就诊。",
        costAmount: 120,
        costNote: "演示费用",
        source: "MANUAL",
        createdByUserId: user.id,
      },
    });
  }

  console.log("Seed complete:", {
    userId: user.id,
    familyId: family.id,
    demoMobileMasked: "199****1001",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
