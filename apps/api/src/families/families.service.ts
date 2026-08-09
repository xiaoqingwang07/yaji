import { Injectable } from "@nestjs/common";
import {
  EventStage,
  FamilyRelation,
  MemberRole,
  PregnancyStatus,
} from "@prisma/client";
import { OnboardingPhase, onboardFamilySchema } from "@yaji/contracts";
import type { z } from "zod";
import { PrismaService } from "../prisma/prisma.service";
import { FamilyAccessService } from "./family-access.service";
import { conflict, notFound } from "../common/errors";

type OnboardInput = z.infer<typeof onboardFamilySchema>;

@Injectable()
export class FamiliesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FamilyAccessService,
  ) {}

  async listFamilies(userId: string) {
    const memberships = await this.prisma.familyMember.findMany({
      where: { userId, status: "ACTIVE", family: { deletedAt: null } },
      include: {
        family: {
          include: {
            motherProfiles: { where: { deletedAt: null }, take: 1 },
            pregnancies: { orderBy: { createdAt: "desc" }, take: 1 },
            babies: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return memberships.map((m) => ({
      id: m.family.id,
      name: m.family.name,
      role: m.role,
      relation: m.relation,
      motherProfile: m.family.motherProfiles[0] ?? null,
      activePregnancy: m.family.pregnancies[0] ?? null,
      baby: m.family.babies[0] ?? null,
    }));
  }

  async getFamily(familyId: string, userId: string) {
    await this.access.requireMembership(familyId, userId, MemberRole.VIEWER);
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: { where: { status: "ACTIVE" }, include: { user: true } },
        motherProfiles: { where: { deletedAt: null } },
        pregnancies: { orderBy: { createdAt: "desc" } },
        babies: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!family || family.deletedAt) throw notFound("家庭不存在");
    return {
      id: family.id,
      name: family.name,
      activePregnancyId: family.activePregnancyId,
      motherProfiles: family.motherProfiles,
      pregnancies: family.pregnancies,
      babies: family.babies,
      members: family.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        relation: m.relation,
        role: m.role,
        displayName: m.user.displayName,
      })),
    };
  }

  async onboard(userId: string, input: OnboardInput) {
    const existing = await this.prisma.familyMember.findFirst({
      where: { userId, status: "ACTIVE", family: { deletedAt: null } },
    });
    if (existing) {
      throw conflict("已有家庭档案，请先完善现有档案或联系支持");
    }

    const familyName = input.familyName ?? defaultFamilyName(input.phase);
    const motherName = input.motherDisplayName ?? "妈妈";
    const relation = input.relationToMother ?? FamilyRelation.MOTHER;

    return this.prisma.$transaction(async (tx) => {
      const family = await tx.family.create({
        data: {
          name: familyName,
          createdByUserId: userId,
          members: {
            create: {
              userId,
              relation,
              role: MemberRole.OWNER,
            },
          },
          motherProfiles: {
            create: {
              displayName: motherName,
              linkedUserId: relation === FamilyRelation.MOTHER ? userId : null,
            },
          },
          consents: {
            create: {
              userId,
              consentType: "SENSITIVE_HEALTH",
              documentVersion: "2026-08-09",
              grantedAt: new Date(),
            },
          },
          auditLogs: {
            create: {
              actorUserId: userId,
              action: "FAMILY_ONBOARD",
              resourceType: "Family",
              metadataSanitized: { phase: input.phase },
            },
          },
        },
        include: { motherProfiles: true },
      });

      const mother = family.motherProfiles[0]!;
      let pregnancy = null;
      let baby = null;

      if (input.phase === OnboardingPhase.PLANNING) {
        pregnancy = await tx.pregnancy.create({
          data: {
            familyId: family.id,
            motherProfileId: mother.id,
            status: PregnancyStatus.PLANNING,
            notes: input.planningStartedAt
              ? `开始备孕：${input.planningStartedAt}`
              : null,
          },
        });
        await tx.family.update({
          where: { id: family.id },
          data: { activePregnancyId: pregnancy.id },
        });
      } else if (input.phase === OnboardingPhase.PREGNANCY) {
        pregnancy = await tx.pregnancy.create({
          data: {
            familyId: family.id,
            motherProfileId: mother.id,
            status: PregnancyStatus.PREGNANT,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            lastMenstrualDate: input.lastMenstrualDate
              ? new Date(input.lastMenstrualDate)
              : null,
          },
        });
        await tx.family.update({
          where: { id: family.id },
          data: { activePregnancyId: pregnancy.id },
        });
      } else {
        baby = await tx.baby.create({
          data: {
            familyId: family.id,
            motherProfileId: mother.id,
            birthDate: new Date(input.babyBirthDate!),
            nickname: input.babyNickname ?? "宝宝",
          },
        });
        await tx.event.create({
          data: {
            familyId: family.id,
            motherProfileId: mother.id,
            babyId: baby.id,
            stage: EventStage.BABY_0_1,
            type: "MILESTONE",
            title: "宝宝档案建立",
            occurredAt: new Date(input.babyBirthDate!),
            source: "SYSTEM",
            createdByUserId: userId,
          },
        });
      }

      return {
        family: { id: family.id, name: family.name },
        motherProfile: mother,
        pregnancy,
        baby,
        phase: input.phase,
      };
    });
  }
}

function defaultFamilyName(phase: OnboardingPhase): string {
  if (phase === OnboardingPhase.PLANNING) return "我们的备孕档案";
  if (phase === OnboardingPhase.BORN) return "我们的宝宝档案";
  return "我们的孕育档案";
}
