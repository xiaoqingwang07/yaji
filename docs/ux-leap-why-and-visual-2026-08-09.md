# 芽纪 UX：下一步「为什么」+ 视觉换代

预览：`http://localhost:8082`  
截图：`docs/ux-screenshots-2026-08-09-vivid/`

## Why

- `NextActionItem.why` / `whyNote`：白话说明「为什么常会安排」，非诊断。
- 孕期 / 备孕 / 已出生 PENDING 下一步均已填 why。
- 「此刻」默认一行摘要 +「展开全文」；底栏「以医生实际安排为准」。
- 参考日程 vs 报告未闭环：副标题分别标「参考日程」「未闭环」。

大排畸 why 原文：

> 大排畸是孕中期常见的系统性胎儿结构超声，通常安排在 20–24 周左右，用来把宝宝主要器官的发育情况记进档案。

## 一眼差异

1. 全幅孕周舞台（亚麻纸底 + 超大衬线数字），不是白卡片堆。
2. 叙事轨道下一步 + 内嵌 why 引述区，不是设置页 Group/Row 待办。
3. 浮动胶囊底栏选中软胶囊；档案 / 健康 / 确认同步去分组列表感。

## 截图

| 文件 | 内容 |
|------|------|
| `01-now-why-visible.png` / `now-with-why.png` | 此刻 · why 首屏 |
| `02-now-why-expanded.png` | 此刻 · why 展开全文 |
| `04-timeline.png` / `timeline.png` | 档案 |
| `05-health.png` / `health.png` | 健康 |
| `08-report-review.png` | 确认 |

## 校验

`cd apps/mobile && npx tsc --noEmit` → 通过（exit 0）
