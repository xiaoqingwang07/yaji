import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { AppError } from "./errors";
import { getRequestId } from "./request-context";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const requestId = getRequestId();

    if (exception instanceof AppError) {
      res.status(exception.status).json({
        error: {
          code: exception.code,
          message: exception.message,
          requestId,
          fieldErrors: exception.fieldErrors,
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === "string"
          ? body
          : ((body as { message?: string | string[] }).message?.toString() ??
            exception.message);
      res.status(status).json({
        error: {
          code: status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR",
          message: Array.isArray(message) ? message.join("; ") : message,
          requestId,
          fieldErrors: [],
        },
      });
      return;
    }

    this.logger.error(
      `Unhandled error requestId=${requestId}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "服务暂时不可用",
        requestId,
        fieldErrors: [],
      },
    });
  }
}
