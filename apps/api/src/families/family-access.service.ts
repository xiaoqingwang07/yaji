import { Injectable } from "@nestjs/common";
import { MemberRole, MemberStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { forbidden, notFound } from "../common/errors";

@Injectable()
export class FamilyAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async requireMembership(
    familyId: string,
    userId: string,
    minRole: MemberRole = MemberRole.VIEWER,
  ) {
    const member = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } },
      include: { family: true },
    });
    if (!member || member.status !== MemberStatus.ACTIVE || member.family.deletedAt) {
      throw notFound("家庭不存在或无权访问");
    }
    if (!roleAtLeast(member.role, minRole)) {
      throw forbidden("当前权限不足");
    }
    return member;
  }
}

function roleAtLeast(actual: MemberRole, min: MemberRole): boolean {
  const rank = { VIEWER: 1, EDITOR: 2, OWNER: 3 } as const;
  return rank[actual] >= rank[min];
}
