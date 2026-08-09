import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { unauthorized } from "../common/errors";

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ userId?: string }>();
    if (!req.userId) throw unauthorized();
    return req.userId;
  },
);
