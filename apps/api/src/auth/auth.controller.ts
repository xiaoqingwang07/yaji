import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import {
  requestCodeSchema,
  verifyCodeSchema,
  devLoginSchema,
} from "@yaji/contracts";
import { z } from "zod";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AuthGuard } from "./auth.guard";
import { CurrentUserId } from "./current-user.decorator";

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("auth/request-code")
  requestCode(@Body(new ZodValidationPipe(requestCodeSchema)) body: z.infer<typeof requestCodeSchema>) {
    return this.auth.requestCode(body.mobile);
  }

  @Post("auth/verify-code")
  verifyCode(@Body(new ZodValidationPipe(verifyCodeSchema)) body: z.infer<typeof verifyCodeSchema>) {
    return this.auth.verifyCode(body);
  }

  @Post("auth/dev-login")
  devLogin(@Body(new ZodValidationPipe(devLoginSchema)) body: z.infer<typeof devLoginSchema>) {
    return this.auth.devLogin(body.displayName);
  }

  @Post("auth/refresh")
  refresh(
    @Body(new ZodValidationPipe(z.object({ refreshToken: z.string().min(1) })))
    body: { refreshToken: string },
  ) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post("auth/logout")
  logout(
    @Body(new ZodValidationPipe(z.object({ refreshToken: z.string().optional() })))
    body: { refreshToken?: string },
  ) {
    return this.auth.logout(body.refreshToken);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentUserId() userId: string) {
    return this.auth.getMe(userId);
  }

  @Patch("me")
  @UseGuards(AuthGuard)
  updateMe(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(z.object({ displayName: z.string().min(1).max(40).optional() })))
    body: { displayName?: string },
  ) {
    return this.auth.updateMe(userId, body.displayName);
  }
}
