import { ScrollViewStyleReset } from "expo-router/html";
import type { ReactNode } from "react";

// Web 端与原生端共用系统字体，不依赖外网字体请求。
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #F6F8F7;
  font-family: "PingFang SC", "Noto Sans SC", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #F6F8F7;
  }
}`;
