import { router, type Href } from "expo-router";

/** 绕过 typedRoutes 生成滞后，统一跳转 */
export function go(href: string) {
  router.push(href as Href);
}

export function goReplace(href: string) {
  router.replace(href as Href);
}
