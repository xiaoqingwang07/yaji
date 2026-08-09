import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { KnowledgeService } from "./knowledge.service";

@Controller()
@UseGuards(AuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get("knowledge-entries/:entryId")
  get(@Param("entryId") entryId: string) {
    return this.knowledge.getEntry(entryId);
  }
}
