export type FieldError = { field: string; message: string };

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
    public readonly fieldErrors: FieldError[] = [],
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function unauthorized(message = "未登录或登录已失效") {
  return new AppError("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "无权限执行此操作") {
  return new AppError("FORBIDDEN", message, 403);
}

export function notFound(message = "资源不存在") {
  return new AppError("NOT_FOUND", message, 404);
}

export function conflict(message: string) {
  return new AppError("CONFLICT", message, 409);
}

export function validationFailed(fieldErrors: FieldError[], message = "参数校验失败") {
  return new AppError("VALIDATION_FAILED", message, 400, fieldErrors);
}
