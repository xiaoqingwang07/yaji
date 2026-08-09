import { useEffect } from "react";
import { goReplace } from "@/src/nav";

/** 已并入「隐私与信任」，保留路由以免旧链接失效 */
export default function PrivacyScreen() {
  useEffect(() => {
    goReplace("/trust");
  }, []);
  return null;
}
