import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { ProvidersModule } from "./providers/providers.module";
import { AuthModule } from "./auth/auth.module";
import { FamiliesModule } from "./families/families.module";
import { KnowledgeModule } from "./knowledge/knowledge.module";
import { RequestIdMiddleware } from "./common/request-id.middleware";

@Module({
  imports: [PrismaModule, ProvidersModule, AuthModule, FamiliesModule, KnowledgeModule],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
