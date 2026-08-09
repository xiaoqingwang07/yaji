import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  requestId: string;
  userId?: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestId() {
  return requestContext.getStore()?.requestId ?? "unknown";
}
