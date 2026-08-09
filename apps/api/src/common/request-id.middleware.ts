import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { requestContext } from "./request-context";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      (req.headers["x-request-id"] as string | undefined) || randomUUID();
    res.setHeader("x-request-id", requestId);
    requestContext.run({ requestId }, () => next());
  }
}
