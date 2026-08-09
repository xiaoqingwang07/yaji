import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { onboardFamilySchema } from "@yaji/contracts";
import type { z } from "zod";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { FamiliesService } from "./families.service";

@Controller()
@UseGuards(AuthGuard)
export class FamiliesController {
  constructor(private readonly families: FamiliesService) {}

  @Get("families")
  list(@CurrentUserId() userId: string) {
    return this.families.listFamilies(userId);
  }

  @Get("families/:familyId")
  get(@CurrentUserId() userId: string, @Param("familyId") familyId: string) {
    return this.families.getFamily(familyId, userId);
  }

  @Post("families/onboard")
  onboard(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(onboardFamilySchema))
    body: z.infer<typeof onboardFamilySchema>,
  ) {
    return this.families.onboard(userId, body);
  }
}
