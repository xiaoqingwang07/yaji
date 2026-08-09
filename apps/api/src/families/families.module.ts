import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { FamiliesController } from "./families.controller";
import { FamiliesService } from "./families.service";
import { FamilyAccessService } from "./family-access.service";

@Module({
  imports: [AuthModule],
  controllers: [FamiliesController],
  providers: [FamiliesService, FamilyAccessService],
  exports: [FamiliesService, FamilyAccessService],
})
export class FamiliesModule {}
