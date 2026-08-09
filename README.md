# 芽纪

属于一个家庭的**孕育档案与解读助手**（备孕 · 孕期 · 妈妈产后恢复 · 宝宝 0–1 岁）。

一句话：把每次检查的报告、医生的话（录音）、在家测的数据交给它；它记得完整历史，用白话告诉你发生了什么、下一个标准节点是什么、下次去医院带什么。不给诊疗建议、不评判医生——让你带着完整的事实去见医生。

| 文档 | 说明 |
|---|---|
| [docs/product-positioning.md](./docs/product-positioning.md) | 产品定位（当前基线） |
| [docs/design-system.md](./docs/design-system.md) | 视觉与设计系统 |
| [docs/ux-spec.md](./docs/ux-spec.md) | 交互与信息架构 |
| [docs/README.md](./docs/README.md) | 全部文档索引 |
| `芽纪-MVP开发执行规格.md` | 需求总源 |
| `PROJECT_PLAN.md` | 执行状态（含 2026-08-09 原型确认） |

## 当前进度

**大步骤二：全量开发**（公共基础进行中）

- 2026-08-09 用户确认：以当前 Expo 原型为开发基准（含 why 下一步与视觉换代）
- Expo 交互原型仍位于最终工程 `apps/mobile`（Fixture 演示逐步替换为真实 API）
- Prisma Schema / OpenAPI / Zod 已对齐 v2.0 实体（导入批次、就诊录音、阶段小结、知识库等）
- API：健康检查、统一错误、JWT 鉴权、Mock SMS、极简建档、知识库条目读取；OCR/LLM/ASR Mock Provider 已就绪

原型汇总：[docs/原型与产品内容汇总-2026-08-09.md](./docs/原型与产品内容汇总-2026-08-09.md)

## 本地运行

### 仅移动端原型

```bash
pnpm install
pnpm --filter @yaji/mobile start
```

推荐先点「一键体验 · 孕期示范」，从「此刻」看节点与下一步；再试「收下报告」与记下医嘱。

### 后端闭环（大步骤二）

```bash
docker compose -f infra/docker-compose.yml up -d
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm --filter @yaji/api start:dev
```

- 健康检查：`GET http://localhost:3001/api/v1/health`
- 开发登录：`POST /api/v1/auth/dev-login`（非生产；演示号脱敏展示）
- 验证码演示：`.env` 中 `DEV_SMS_CODE=123456`，勿使用真实手机号

无第三方密钥时 `OCR_PROVIDER` / `LLM_PROVIDER` / `ASR_PROVIDER` / `SMS_PROVIDER` 均为 `mock`，仍须可完整演示。

## 目录

```text
apps/mobile         Expo 原型与正式客户端
apps/api            NestJS API
packages/contracts  Zod 与枚举
prisma/             数据模型与种子
docs/               产品、设计、UX、架构、OpenAPI、追踪矩阵
fixtures/ocr/       Mock OCR 脱敏样本
fixtures/knowledge/ 自建知识库初始条目（术语 / 日历 / 清单）
```

## 产品边界（摘要）

- 档案工具 + 出诊后助手，不是社区 / 互联网医院 / 诊断工具
- AI 只做①术语解释与②档案事实提示；不做③行动建议与④医生评判
- OCR / 录音转写 / AI 必须经用户确认才进正式档案
- 健康模块与档案同源，不重复录入
- 不做喂奶睡眠排泄等高频生活记录、社区、广告、打卡催办
- 信任承诺：加密存储、绝不用于模型训练、随时导出、删除即删除

## Agent 模型约束

全量开发期间子代理仅允许 Grok（`cursor-grok-4.5-high-fast`）或 Composer（`composer-2.5-fast`），禁止 Claude / GPT。
