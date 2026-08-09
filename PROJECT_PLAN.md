# 芽纪 MVP 执行清单

> 唯一执行状态源。需求来源：`芽纪-MVP开发执行规格.md` v2.0  
> 当前状态：**大步骤二进行中 — 公共基础 / 契约对齐（原型已于 2026-08-09 冻结）**

---

## 产品原型确认（唯一冻结点）

| 项 | 内容 |
|---|---|
| 确认日期 | **2026-08-09** |
| 确认结论 | 用户明确：差不多了，可以按这版原型进行开发 |
| 开发基准 | 当前 Expo 工程 `apps/mobile` 可交互原型（含「此刻」why 下一步、视觉换代，见 `docs/ux-leap-why-and-visual-2026-08-09.md`、`docs/原型与产品内容汇总-2026-08-09.md`） |
| 冻结范围 | 底部导航与主流程、字段语义、权限矩阵（可查看/可编辑）、数据实体与 API 主路径、AI 四层边界、P1/明确不做排除项 |
| 允许例外 | 安全/阻塞问题；实现细节按规格自行决策，不重复产品确认 |
| Agent 模型约束 | 仅允许 `cursor-grok-4.5-high-fast` / `composer-2.5-fast`（或父已是二者时的 `inherit`）；禁止 Claude / GPT |

---

## 四大步骤总览

| 大步骤 | 状态 | 说明 |
|---|---|---|
| 一、整体设计与可复用原型 | ✅ 已完成 | 2026-08-09 用户确认冻结；文档、契约初稿、Prisma、Expo 交互原型可复用 |
| 二、全量开发 | 🔄 进行中 | 按依赖连续推进：公共基础 → 账号家庭 → 档案闭环 → … |
| 三、系统测试与集中修复 | ⏳ 待开始 | 系统级验证与缺陷修复 |
| 四、发布验收与交付 | ⏳ 待开始 | 验收与交付 |

---

## 大步骤一清单

### 1. 需求基线
- [x] `docs/product-baseline.md` 需求编号
- [x] `docs/traceability-matrix.md` 追踪矩阵
- [x] `docs/backlog.md` P1 / 明确不做

### 2. 信息架构与交互原型
- [x] `apps/mobile` 正式 Expo Router 工程
- [x] 设计 Token 与通用组件（见 `docs/design-system.md`）
- [x] 产品定位与 UX 文档整理（`docs/product-positioning.md` 等）
- [x] Fixture 脱敏数据驱动全部 MVP 页面
- [x] 主流程可点击走通（含「此刻」与报告 AI 确认）
- [x] 加载 / 空 / 失败 / 无权限状态入口
- [x] 产品定义访谈与收敛（38 问，v3 定位已获用户确认）
- [x] 原型增补：存量批量导入、就诊录音流程、备孕建档、费用字段、标准日历（客户端 Fixture / Mock 可点通）
- [x] **用户一次产品确认（冻结点）— 2026-08-09**

### 3. 技术总体设计
- [x] Monorepo 骨架（mobile / api / contracts / config / ui）
- [x] Prisma Schema 初稿（大步骤二起对齐 v2.0 增量实体）
- [x] OpenAPI 初始契约
- [x] 共享 Zod / 枚举
- [x] `docs/architecture.md`
- [x] `docs/privacy-data-map.md`
- [x] `docs/ux-spec.md` / `docs/design-system.md` / `docs/product-positioning.md`

### 4. 测试设计
- [x] 测试清单写入 `docs/test-plan.md`
- [x] Mock OCR 样本目录 `fixtures/ocr/`
- [ ] 自动化测试随大步骤二同步补齐

---

## MVP 功能包（大步骤二依赖序）

| 包 | 需求前缀 | 状态 |
|---|---|---|
| FOUNDATION | NFR / 公共基础 | 🔄 进行中：Schema v2.0、契约、鉴权框架、Mock Provider、迁移种子 |
| AUTH | AUTH / ONBOARD | 原型完成；API 实装中 |
| EVENT | EVENT | 原型完成；待真实 API |
| REPORT | REPORT | 原型 + Mock OCR 样本；待真实 API / 批量导入 |
| VOICE | VOICE | 原型 Mock；待真实 API |
| SUMMARY | AI-004 | 原型 Mock；待真实 API |
| CALENDAR | NOW-005 / 006 | 原型 Fixture；待知识库载入与聚合 API |
| HEALTH | HEALTH | 原型完成；待真实 API / 居家监测 |
| REMINDER | REMINDER | 原型完成；待真实 API |
| FAMILY | FAMILY | 原型完成；权限收敛为可查看/可编辑 |
| PRIVACY | PRIVACY | 原型完成；待真实导出删除 |

---

## 临时方案登记

| 项 | 原因 | 移除条件 | 截止点 |
|---|---|---|---|
| 移动端 Fixture 内存数据源 | 大步骤一确认交互；大步骤二逐步替换 | 接入真实 API 后移除入口 | 大步骤二结束前 |
| OCR / LLM / ASR / SMS Mock Provider | 保证无密钥可完整演示 | 配置境内服务密钥后切换；客户端需标示演示模式 | 生产前禁用 mock |
| 原图对照仅页级定位 | 多模态模型不提供可靠坐标 | 接入具备坐标能力的 OCR 后可升级为区域高亮 | 非阻塞，P1 |

---

## 大步骤二阶段性汇报（2026-08-09）

```text
已完成
- 记录唯一产品原型确认（本文件顶部）
- Prisma Schema 对齐 v2.0（ImportBatch / VisitRecording / StageSummary / KnowledgeEntry 等）
- packages/contracts 枚举与 Zod 与原型数据模型对齐
- OpenAPI 补齐导入 / 录音 / 小结 / 此刻 / 日历 / 知识库路径
- API 公共基础：统一错误、请求 ID、Prisma、Mock SMS/OCR/LLM/ASR、JWT 鉴权、dev-login、家庭极简建档
- 脱敏种子与知识库 fixture 载入机制

关键文件
- PROJECT_PLAN.md、prisma/schema.prisma、prisma/seed.ts、packages/contracts/**、docs/openapi.yaml、apps/api/src/**、fixtures/knowledge/**、README.md、.env.example

验证结果
- 见对话回报中的 typecheck / test 实际输出

已知限制
- 档案/报告/录音/健康等业务模块尚未接真实 API；移动端仍以 Fixture 演示
- 对象存储与异步 Worker 仅有适配层骨架

下一步
- 连续完成 AUTH/ONBOARD 与档案主闭环（事件 + 报告确认），不重新规划
```

---

## 变更记录

| 日期 | 内容 |
|---|---|
| 2026-08-03 | 启动大步骤一：创建执行清单、工程骨架与交互原型 |
| 2026-08-06 | 主线重构：极简建档、「此刻」首页、报告白话解读与建议下一步 |
| 2026-08-07 | 整理产品定位与设计文档：`product-positioning` / `design-system` / UX 规格 / 文档索引 |
| 2026-08-07 | 定位收敛（用户确认方向）：自用型孕育工具叙事；标准产检/疫苗日历入 MVP（NOW-005）；家庭权限简化为可查看/可编辑；就诊摘要与完整角色矩阵落 P1 |
| 2026-08-07 | 新增「阶段小结」跨报告事实汇总（AI-004，MVP）：解决"单份报告都懂、几个月串不起来"的痛点；仅汇总原文事实，不产生新医学结论 |
| 2026-08-08 | 完成 38 问种子用户深度访谈，产品定义收敛为 v3 并经用户确认：备孕归档入范围；就诊录音转写升 MVP（VOICE-*）；批量存量导入（REPORT-011）；费用轻量记录（EVENT-008）；标准日历扩展产后节点与材料清单（NOW-005/006）；解读标官方出处与边界四层模型（AI-005/006）；信任承诺（PRIVACY-005）；老人端/挂号缴费明确不做 |
| 2026-08-08 | **执行规格升级为 v2.0**，成为唯一基线 |
| 2026-08-08 | 技术决策确认：接入境内大模型 API Key（数据不出境）；解读出处采用自建可控知识库（`fixtures/knowledge/`）；原图对照精度首版定为页级，`boundingBox` 可选 |
| 2026-08-09 | UX：下一步「为什么」+ 视觉换代（`docs/ux-leap-why-and-visual-2026-08-09.md`） |
| **2026-08-09** | **唯一产品原型确认：以当前 Expo 原型为开发基准（含 why 下一步与视觉换代）。进入大步骤二全量开发。Agent 模型仅 Grok / Composer。** |
